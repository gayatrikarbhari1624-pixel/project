# ZK Campus Vault 🎓🛡️

Privacy-First Student Credentials and Verification on the Midnight Network.

ZK Campus Vault eliminates fake degrees and protects student privacy using the **Midnight blockchain** and **Zero-Knowledge Proofs (ZKPs)**. It allows universities to issue tamper-proof digital certificates, and students to prove their qualifications (like GPA thresholds or enrollment status) to employers without revealing their actual data.

## Features

- **Tamper-Proof Issuance**: Universities hash student credentials into a 32-byte commitment stored on-chain.
- **100% Privacy for Students**: Students generate ZK proofs locally on their device. No personal data is exposed.
- **Instant Verification**: Employers can verify the cryptographic proofs instantly without ever seeing the student's actual marks or ID.

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
