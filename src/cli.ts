/**
 * Interactive CLI for ZK Campus Vault on Midnight Network
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'campusVaultPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'campus_vault');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const CampusVault = await import(pathToFileURL(contractPath).href);

// Private witness state stored locally for ZK proofs
interface PrivateVaultState {
  student_id?: bigint;
  degree_code?: number;
  gpa_x100?: number;
  salt?: Uint8Array;
}

let localWitnessState: PrivateVaultState = {};

const witnesses = {
  get_student_id: (): bigint => localWitnessState.student_id ?? 0n,
  get_degree_code: (): number => localWitnessState.degree_code ?? 0,
  get_gpa: (): number => localWitnessState.gpa_x100 ?? 0,
  get_salt: (): Uint8Array => localWitnessState.salt ?? new Uint8Array(32),
};

const compiledContract = CompiledContract.make('campus_vault', CampusVault.Contract).pipe(
  CompiledContract.withWitnesses(witnesses as any),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'campus-vault-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║               ZK Campus Vault CLI                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deployment on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network:  ${network}\n`);

  try {
    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    
    console.log('  Syncing with network...');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    console.log('  ✅ Connected!\n');

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Issue Digital Credential (Admin)');
      console.log('  2. Revoke Credential (Admin)');
      console.log('  3. Prove Student Enrollment (ZK Proof)');
      console.log('  4. Prove GPA Threshold (ZK Proof)');
      console.log('  5. Query Total Credentials Issued');
      console.log('  6. Check Wallet Balance');
      console.log('  7. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          console.log('\n--- Issue Credential ---');
          const studentIdStr = await rl.question('  Student ID (numeric): ');
          const degreeCodeStr = await rl.question('  Degree Code (numeric): ');
          const gpaStr = await rl.question('  GPA (e.g. 3.8): ');
          
          const studentId = BigInt(studentIdStr || '1001');
          const degreeCode = parseInt(degreeCodeStr || '101');
          const gpaX100 = Math.round(parseFloat(gpaStr || '3.8') * 100);
          
          const salt = new Uint8Array(32);
          crypto.getRandomValues(salt);

          console.log('\n  Submitting transaction to Midnight...');
          try {
            const tx = await deployed.callTx.issue_credential(studentId, degreeCode, gpaX100, salt);
            console.log(`\n  ✅ Credential Issued!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block Height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Issue failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          console.log('\n--- Revoke Credential ---');
          const hexCommitment = await rl.question('  Commitment (32-byte hex string): ');
          if (!hexCommitment || hexCommitment.length !== 64) {
            console.log('  ❌ Invalid commitment hex length.');
            break;
          }
          const commitmentBytes = Buffer.from(hexCommitment, 'hex');
          
          console.log('\n  Submitting revocation transaction...');
          try {
            const tx = await deployed.callTx.revoke_credential(commitmentBytes);
            console.log(`\n  ✅ Credential Revoked!`);
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ Revocation failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '3': {
          console.log('\n--- Prove Enrollment (Zero-Knowledge) ---');
          const hexCommitment = await rl.question('  Commitment (32-byte hex string): ');
          const studentIdStr = await rl.question('  Your Private Student ID: ');
          const degreeCodeStr = await rl.question('  Your Private Degree Code: ');
          const gpaStr = await rl.question('  Your Private GPA: ');
          const saltHex = await rl.question('  Your Private Salt (hex 64 chars): ');

          if (!hexCommitment || hexCommitment.length !== 64) {
            console.log('  ❌ Invalid commitment hex format.');
            break;
          }

          localWitnessState = {
            student_id: BigInt(studentIdStr || '1001'),
            degree_code: parseInt(degreeCodeStr || '101'),
            gpa_x100: Math.round(parseFloat(gpaStr || '3.8') * 100),
            salt: saltHex ? Buffer.from(saltHex, 'hex') : new Uint8Array(32),
          };

          console.log('\n  Generating ZK Proof of Enrollment off-chain & verifying on-chain...');
          try {
            const commitmentBytes = Buffer.from(hexCommitment, 'hex');
            const tx = await deployed.callTx.prove_enrollment(commitmentBytes);
            console.log(`\n  ✅ ZK Proof Verified! Enrollment is valid.`);
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ ZK Proof failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '4': {
          console.log('\n--- Prove GPA Threshold (Zero-Knowledge) ---');
          const minGpaStr = await rl.question('  Required Minimum GPA (e.g. 3.5): ');
          const studentIdStr = await rl.question('  Your Private Student ID: ');
          const degreeCodeStr = await rl.question('  Your Private Degree Code: ');
          const actualGpaStr = await rl.question('  Your Actual Private GPA: ');
          const saltHex = await rl.question('  Your Private Salt (hex 64 chars): ');

          const minGpaX100 = Math.round(parseFloat(minGpaStr || '3.5') * 100);

          localWitnessState = {
            student_id: BigInt(studentIdStr || '1001'),
            degree_code: parseInt(degreeCodeStr || '101'),
            gpa_x100: Math.round(parseFloat(actualGpaStr || '3.8') * 100),
            salt: saltHex ? Buffer.from(saltHex, 'hex') : new Uint8Array(32),
          };

          console.log('\n  Generating ZK Proof for GPA >= ' + minGpaStr + '...');
          try {
            const tx = await deployed.callTx.prove_gpa_threshold(minGpaX100);
            console.log(`\n  ✅ ZK Proof Verified! GPA threshold condition satisfied without revealing actual GPA.`);
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ ZK Proof failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '5': {
          console.log('\n  Querying contract public ledger state...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledgerState = CampusVault.ledger(contractState.data);
              console.log(`\n  📊 Total Credentials Issued: ${ledgerState.total_credentials_issued}`);
              console.log(`  📊 Revocation Registry Root Hash: ${Buffer.from(ledgerState.revocation_registry).toString('hex')}\n`);
            } else {
              console.log('\n  📊 No public state returned.\n');
            }
          } catch (error) {
            console.error('\n  ❌ Failed to query state:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '6': {
          console.log('\n  Checking wallet balance...');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST:   ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '7':
          running = false;
          console.log('\n  👋 Goodbye!\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please enter 1-7.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
