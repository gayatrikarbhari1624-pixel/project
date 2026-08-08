/**
 * Check wallet balance for current active network
 */
import { resolveNetwork, getOrCreateSeed } from './network';
import { createWallet, unshieldedToken } from './wallet';
import { WebSocket } from 'ws';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

async function main() {
  const { network, config: networkConfig } = resolveNetwork();
  const seed = getOrCreateSeed(network);

  console.log(`\nChecking balance for network: ${network}...`);
  const walletCtx = await createWallet({ network, networkConfig, seed });

  const state = await walletCtx.wallet.waitForSyncedState();
  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust.balance(new Date());

  const address = walletCtx.unshieldedKeystore.getBech32Address();

  console.log(`\nAddress:  ${address}`);
  console.log(`tNight:   ${balance.toLocaleString()}`);
  console.log(`DUST:     ${dustBalance.toLocaleString()}\n`);

  await walletCtx.wallet.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
