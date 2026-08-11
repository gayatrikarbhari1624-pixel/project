# ZK Campus Vault 🎓🛡️

Privacy-First Student Credentials and Verification on the Midnight Network.

ZK Campus Vault eliminates fake degrees and protects student privacy using the **Midnight blockchain** and **Zero-Knowledge Proofs (ZKPs)**. It allows universities to issue tamper-proof digital certificates, and students to prove their qualifications (like GPA thresholds or enrollment status) to employers without revealing their actual data.

## Features

- **Tamper-Proof Issuance**: Universities hash student credentials into a 32-byte commitment stored on-chain.
- **100% Privacy for Students**: Students generate ZK proofs locally on their device. No personal data is exposed.
- **Instant Verification**: Employers can verify the cryptographic proofs instantly without ever seeing the student's actual marks or ID.

## Live Demo

🚀 **Vercel Web App**: [https://zk-campus-vault-d2sw.vercel.app/](https://zk-campus-vault-d2sw.vercel.app/)

## Screenshots & UI Flow

### Main Dashboard
![Main Dashboard](./screenshots/main_dashboard.png)

### Student Credentials Vault
![Student Credentials Vault](./screenshots/student_vault.png)

## Deployed Smart Contract (Preprod Testnet)

- **Contract Address**: `02008f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e`
- **Deployer Address**: `mn_addr_preprod1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s`

## Deployed Smart Contract (Local Devnet)

- **Contract Address**: `3df730f55ed9ed960581bd7afe1aa88edbcd60414d5474d67870d938bd7d99ef`
- **Deployer Address**: `mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s`

## Prerequisites

- Node.js (v22+)
- Docker (Required for the local Midnight Proof Server)
- Git

## Project Structure

- `contracts/`: Midnight Compact smart contracts (`campus_vault.compact`).
- `src/`: TypeScript backend CLI and deployment scripts.
- `frontend/`: React + Vite frontend for interacting with the vault.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
cd frontend
npm install
cd ..
```

### 2. Start the Local Proof Server (Docker Required)
You must have Docker running to start the local Midnight proof server.
```bash
npm run proof-server:start
```

### 3. Compile the Smart Contract
```bash
npm run compile
```

### 4. Deploy the Contract
This script will deploy the contract and save the state to `.midnight-state.json`.
```bash
npm run deploy
```

### 5. Run the Frontend (UI)
```bash
cd frontend
npm run dev
```
Then open `http://localhost:3000` in your browser.

## CLI Interaction

You can also interact with the contract using the CLI:
```bash
npm run cli
```

## Built With
- **Midnight Network & Compact Language**
- TypeScript & Node.js
- React & Vite

---
*Built for the INTO the Midnight SPPU Bootcamp (Rise In)*
