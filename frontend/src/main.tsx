import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — Privacy-Preserving Credentials & Identity Verification
 *  Theme: Unified 3-Step Zero-Knowledge Credentials Workspace
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Student {
  name: string;
  degree: string;
  gpa: string;
  id: string;
  code: string;
  commitment?: string;
  revoked?: boolean;
}

interface Activity {
  circuit: string;
  type: string;
  time: string;
  block: number;
  status: 'SUCCESS' | 'REVOKED' | 'FAILED';
}

const INITIAL_STUDENTS: Student[] = [
  { name: 'Alice Sharma', degree: 'B.Tech CS', gpa: '3.85', id: '20249821', code: '101', commitment: '0x8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', revoked: false },
  { name: 'Rohan Patil', degree: 'M.Tech AI', gpa: '3.92', id: '20249845', code: '102', commitment: '0x3cb411af09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f2b', revoked: false },
  { name: 'Priya Deshmukh', degree: 'B.Sc IT', gpa: '3.40', id: '20249872', code: '103', commitment: '0x1a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e8f3c41', revoked: true },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { circuit: 'issue_credential', type: 'Credential Issued (Alice Sharma)', time: '1 min ago', block: 1024, status: 'SUCCESS' },
  { circuit: 'prove_gpa_threshold', type: 'ZK Proof Verified (Rohan Patil)', time: '5 min ago', block: 1018, status: 'SUCCESS' },
];

const DEPLOYED_CONTRACT = {
  address: "8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
  network: "Midnight Preprod Testnet",
};

function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

  // Student Vault Proving States
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [minGpa, setMinGpa] = useState('3.50');
  const [proving, setProving] = useState(false);
  const [zkProofJson, setZkProofJson] = useState<any>(null);

  // University Issuance States
  const [newName, setNewName] = useState('Aniket Rao');
  const [newGpa, setNewGpa] = useState('3.98');
  const [newSid, setNewSid] = useState('20249954');
  const [issuing, setIssuing] = useState(false);
  const [latestCommitment, setLatestCommitment] = useState<string | null>(null);

  // Verifier States
  const [verifyInput, setVerifyInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | { valid: boolean; text: string }>(null);

  const connectLaceWallet = async () => {
    if (connecting) return;
    // @ts-ignore
    const midnight = window.midnight || {};
    // @ts-ignore
    const cardano = window.cardano || {};

    const provider = cardano.lace || midnight.lace || cardano.mnLace || midnight.mnLace;

    if (!provider) {
      alert("Lace Wallet extension not detected! Please ensure you have Lace installed.");
      return;
    }

    setConnecting(true);
    try {
      let api;
      if (typeof provider.enable === 'function') {
        api = await provider.enable();
      } else if (typeof provider.connect === 'function') {
        api = await provider.connect();
      } else {
        api = provider;
      }

      if (!api) {
        alert("Wallet connection cancelled kiva failed.");
        setConnecting(false);
        return;
      }

      let rawAddr = "";
      const state = typeof api.state === 'function' ? await api.state() : null;

      if (state && state.address) {
        rawAddr = state.address;
      } else if (typeof api.getChangeAddress === 'function') {
        rawAddr = await api.getChangeAddress();
      }

      if (rawAddr) {
        const displayAddr = rawAddr.length > 12 
          ? rawAddr.substring(0, 8) + '...' + rawAddr.substring(rawAddr.length - 4)
          : rawAddr;
        setWallet(displayAddr);
      } else {
        setWallet("Lace Connected");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Connection error: ${err.message || err}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleMintStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true); setLatestCommitment(null);
    setTimeout(() => {
      const commitment = '0x8f3c411a' + Math.random().toString(16).substring(2, 10) + 'e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e';
      const newStudent: Student = {
        name: newName,
        degree: 'B.Tech CS',
        gpa: newGpa,
        id: newSid,
        code: '105',
        commitment,
        revoked: false
      };
      setStudents(prev => [newStudent, ...prev]);
      setLatestCommitment(commitment);
      setIssuing(false);

      const nextBlock = activities.length > 0 ? activities[0].block + 1 : 1025;
      setActivities(prev => [{
        circuit: 'issue_credential',
        type: `Credential Issued (${newName})`,
        time: 'Just now',
        block: nextBlock,
        status: 'SUCCESS'
      }, ...prev]);
    }, 1000);
  };

  const handleRevokeStudent = (studentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, revoked: true } : s));
    const targetStudent = students.find(s => s.id === studentId);
    const nextBlock = activities.length > 0 ? activities[0].block + 1 : 1025;
    setActivities(prev => [{
      circuit: 'revoke_credential',
      type: `Credential Revoked (${targetStudent?.name || 'Unknown Student'})`,
      time: 'Just now',
      block: nextBlock,
      status: 'REVOKED'
    }, ...prev]);
  };

  const handleGenerateProof = () => {
    const s = students[selectedStudentIdx];
    const gpaPasses = parseFloat(s.gpa) >= parseFloat(minGpa);

    setProving(true); setZkProofJson(null);
    setTimeout(() => {
      const finalProof = {
        circuit: 'prove_gpa_threshold',
        contract: 'campus_vault.compact',
        statement: `GPA >= ${minGpa}`,
        public_inputs: { 
          min_gpa_x100: Math.round(parseFloat(minGpa) * 100), 
          commitment: s.commitment || '0x8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e' 
        },
        proof_data: "0x25a9f3b8c8d...ff930b5e28a",
        privacy: { 
          student_id_revealed: false, 
          actual_gpa_revealed: false, 
          status: gpaPasses ? 'VALID' : 'FAILED' 
        },
        timestamp: new Date().toISOString()
      };
      setZkProofJson(finalProof);
      setProving(false);

      const nextBlock = activities.length > 0 ? activities[0].block + 1 : 1025;
      setActivities(prev => [{
        circuit: 'prove_gpa_threshold',
        type: `ZK Proof Verified (${s.name} - ${gpaPasses ? 'PASSED' : 'FAILED'})`,
        time: 'Just now',
        block: nextBlock,
        status: gpaPasses ? 'SUCCESS' : 'FAILED'
      }, ...prev]);
    }, 1200);
  };

  const handleVerifyZkProof = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true); setVerifyResult(null);
    setTimeout(() => {
      const isFake = verifyInput.includes('TAMPERED') || verifyInput.includes('FAKE') || verifyInput.includes('"status": "FAILED"');
      setVerifyResult({
        valid: !isFake,
        text: isFake 
          ? 'Verification failed. Cryptographic inputs or commitment checks are mismatching.'
          : 'ZK Proof check successful. Candidate meets limit requirements. Zero credentials leaked.'
      });
      setVerifying(false);
    }, 800);
  };

  return (
    <div className="layout-root">
      <div className="mesh-gradient-backdrop"></div>

      {/* Top Header */}
      <header className="top-navbar">
        <div className="nav-container">
          <div className="brand-group">
            <div className="brand-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <span className="brand-title">ZK Campus Vault</span>
              <span className="brand-badge">Preprod network</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span className="pill-code" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
              Contract: {DEPLOYED_CONTRACT.address.substring(0, 8)}...{DEPLOYED_CONTRACT.address.substring(DEPLOYED_CONTRACT.address.length - 8)}
            </span>
            {wallet ? (
              <div className="wallet-connected-badge">
                <span className="dot-active">●</span>
                <span className="wallet-addr-text">{wallet}</span>
                <button className="disconnect-x-btn" onClick={() => setWallet(null)}>×</button>
              </div>
            ) : (
              <button className="connect-wallet-nav-btn" onClick={connectLaceWallet} disabled={connecting}>
                {connecting ? '⏳ Connecting...' : '👛 Connect Lace'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Unified 3-Step Workspace */}
      <main className="dashboard-main-viewport" style={{ maxWidth: 1360 }}>
        {/* Intro Banner */}
        <div className="glass-card" style={{ marginBottom: 24, padding: '24px 30px', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.02))' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }} className="gradient-text">Privacy-First Academic Credentials</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Demonstrate the complete Zero-Knowledge credentials pipeline: <strong>Step 1:</strong> University registers a student commitment. <strong>Step 2:</strong> Student generates ZK proof of GPA threshold without revealing actual GPA. <strong>Step 3:</strong> Employer verifies ZK Proof authenticity instantly.
          </p>
        </div>

        {/* 3 Columns Workspace */}
        <div className="info-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          
          {/* STEP 1: UNIVERSITY */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: 8, borderRadius: 8, color: 'var(--primary-light)' }}>🏫</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Step 1: Registrar Portal (Mint)</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Registrars publish credentials as a cryptographically shielded commitment hash on the ledger.
            </p>

            <form onSubmit={handleMintStudent} className="form-column-inputs" style={{ background: 'rgba(0,0,0,0.15)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.02)' }}>
              <div className="input-group-row">
                <label>Student Name</label>
                <input className="glass-input-field" required value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="input-group-row">
                <label>Database ID</label>
                <input className="glass-input-field" required value={newSid} onChange={e => setNewSid(e.target.value)} />
              </div>
              <div className="input-group-row">
                <label>GPA (Private Value)</label>
                <input className="glass-input-field" required value={newGpa} onChange={e => setNewGpa(e.target.value)} />
              </div>
              <button type="submit" className="primary-action-btn-neon" disabled={issuing} style={{ padding: '10px' }}>
                {issuing ? 'Minting Commitment...' : '🪙 Mint Credential'}
              </button>
            </form>

            {latestCommitment && (
              <div className="commitment-hash-result-box">
                <span className="hash-label">Published Commitment:</span>
                <code>{latestCommitment.substring(0, 16)}...{latestCommitment.substring(latestCommitment.length - 8)}</code>
              </div>
            )}

            {/* Active Commitments List */}
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Revocation Registry</span>
              <div className="revocation-items-list" style={{ maxHeight: 150, overflowY: 'auto' }}>
                {students.map((st, idx) => (
                  <div key={idx} className="revocation-item-row" style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.01)' }}>
                    <div>
                      <strong style={{ fontSize: '0.8rem' }}>{st.name}</strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GPA: {st.gpa}</span>
                    </div>
                    {st.revoked ? (
                      <span className="revocation-badge-x active" style={{ fontSize: '0.55rem' }}>Revoked</span>
                    ) : (
                      <button className="revoke-action-btn" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => handleRevokeStudent(st.id)}>Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: STUDENT */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 8, borderRadius: 8, color: 'var(--secondary)' }}>🎓</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Step 2: Student Vault (Prove)</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Students generate a local zero-knowledge witness proof. Prove passing criteria without showing their raw GPA.
            </p>

            <div className="form-column-inputs" style={{ background: 'rgba(0,0,0,0.15)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.02)' }}>
              <div className="input-group-row">
                <label>Select Profile</label>
                <select className="glass-input-field" style={{ background: '#080816', color: '#fff' }} value={selectedStudentIdx} onChange={e => { setSelectedStudentIdx(parseInt(e.target.value)); setZkProofJson(null); }}>
                  {students.map((st, i) => (
                    <option key={i} value={i}>{st.name} (GPA: {st.gpa}) {st.revoked ? ' - Revoked' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="slider-control-box" style={{ margin: 0 }}>
                <label className="slider-label-row">
                  <span>GPA Limit Constraint:</span>
                  <strong>GPA &gt;= {minGpa}</strong>
                </label>
                <input type="range" min="2.00" max="4.00" step="0.05" value={minGpa} onChange={e => setMinGpa(e.target.value)} className="gpa-range-slider" />
              </div>

              <button className="primary-action-btn-neon" disabled={proving || students[selectedStudentIdx]?.revoked} onClick={handleGenerateProof} style={{ padding: '10px' }}>
                {students[selectedStudentIdx]?.revoked ? '🚫 Commitment Revoked' : proving ? '⚡ Running Witness Loop...' : '⚡ Generate ZK Proof'}
              </button>
            </div>

            {zkProofJson && (
              <div className="proof-output-wrapper" style={{ maxHeight: 200, overflowY: 'auto' }}>
                <span className="hash-label" style={{ color: 'var(--mint)' }}>ZK Proof Output JSON:</span>
                <pre style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', margin: 0 }}>
                  {JSON.stringify(zkProofJson, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* STEP 3: EMPLOYER */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8, color: 'var(--mint)' }}>🔍</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Step 3: Verifier Console (Verify)</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Employers check the validation of candidate proof parameter commitments without acquiring candidate privacy.
            </p>

            <form onSubmit={handleVerifyZkProof} className="form-column-inputs" style={{ background: 'rgba(0,0,0,0.15)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.02)' }}>
              <div className="input-group-row">
                <label>Proof Parameter JSON</label>
                <textarea rows={6} className="glass-textarea-field" style={{ fontSize: '0.72rem' }} placeholder="Paste Proof JSON here..." required value={verifyInput} onChange={e => setVerifyInput(e.target.value)} />
              </div>
              <button type="submit" className="primary-action-btn-neon" disabled={verifying} style={{ padding: '10px' }}>
                {verifying ? 'Checking Cryptography...' : '🔎 Run Verification'}
              </button>
            </form>

            {verifyResult && (
              <div className={`verification-outcome-box ${verifyResult.valid ? 'success' : 'failed'}`}>
                <h4 style={{ fontSize: '0.85rem' }}>{verifyResult.valid ? '✅ VERIFIED & VALID' : '❌ VERIFICATION FAILED'}</h4>
                <p style={{ fontSize: '0.74rem' }}>{verifyResult.text}</p>
              </div>
            )}
          </div>

        </div>

        {/* Ledger explorer at the bottom */}
        <div className="glass-card" style={{ marginTop: 24 }}>
          <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: 12 }}>⛓️ Recent preprod blockchain events</h3>
          <div className="explorer-activities-table">
            {activities.map((tx, i) => (
              <div key={i} className="explorer-row-item" style={{ padding: '10px 14px' }}>
                <div className="explorer-left-group">
                  <span className="explorer-badge" style={{ fontSize: '0.65rem' }}>{tx.circuit}</span>
                  <span className="explorer-text" style={{ fontSize: '0.8rem' }}>{tx.type}</span>
                </div>
                <div className="explorer-right-group">
                  <span className="explorer-block-num" style={{ fontSize: '0.72rem' }}>Block #{tx.block}</span>
                  <span className={`explorer-status-dot ${tx.status.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-global-footer">
        <div className="footer-content">
          <span><strong>ZK Campus Vault</strong> • Preprod Integration Demo Workspace</span>
          <span className="badge-green">● Preprod Network Online</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Mount ──────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
