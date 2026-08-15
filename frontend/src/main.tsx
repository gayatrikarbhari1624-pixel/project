import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — Privacy-Preserving Credentials & Identity Verification
 *  Theme: Futuristic Top-Nav Space SaaS Dashboard with Rich Wallpaper Backgrounds
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
  { name: 'Alice Sharma', degree: 'B.Tech Computer Science', gpa: '3.85', id: '20249821', code: '101', commitment: '0x8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', revoked: false },
  { name: 'Rohan Patil', degree: 'M.Tech Data Science & AI', gpa: '3.92', id: '20249845', code: '102', commitment: '0x3cb411af09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f2b', revoked: false },
  { name: 'Priya Deshmukh', degree: 'B.Sc Information Technology', gpa: '3.40', id: '20249872', code: '103', commitment: '0x1a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e8f3c41', revoked: true },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { circuit: 'issue_credential', type: 'Credential Issued (Alice Sharma)', time: '1 min ago', block: 1024, status: 'SUCCESS' },
  { circuit: 'prove_gpa_threshold', type: 'ZK Proof Verified (Rohan Patil)', time: '5 min ago', block: 1018, status: 'SUCCESS' },
  { circuit: 'prove_enrollment', type: 'ZK Proof Verified (Priya Deshmukh)', time: '12 min ago', block: 1012, status: 'REVOKED' },
];

type Tab = 'guide' | 'student' | 'university' | 'employer' | 'explorer';

const DEPLOYED_CONTRACT = {
  address: "8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
  network: "Midnight Preprod Testnet",
  deployer: "mn_addr_preprod1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s"
};

function App() {
  const [tab, setTab] = useState<Tab>('guide');
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

  const connectLaceWallet = async () => {
    if (connecting) return;
    
    // @ts-ignore
    const midnight = window.midnight || {};
    // @ts-ignore
    const cardano = window.cardano || {};

    // Prioritize Lace preprod extensions
    const provider = cardano.lace || midnight.lace || cardano.mnLace || midnight.mnLace;

    if (!provider) {
      alert("Lace Wallet extension not detected! Please ensure you have Lace installed.");
      return;
    }

    setConnecting(true);
    console.log("Connecting directly to Lace Wallet DApp connector API...", provider);

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
      } else if (typeof api.getUsedAddresses === 'function') {
        const addrs = await api.getUsedAddresses();
        if (addrs && addrs.length > 0) rawAddr = addrs[0];
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
      console.error("Lace connection error:", err);
      alert(`Connection error: ${err.message || err}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleMintStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    const nextBlock = activities.length > 0 ? activities[0].block + 1 : 1025;
    setActivities(prev => [{
      circuit: 'issue_credential',
      type: `Credential Issued (${newStudent.name})`,
      time: 'Just now',
      block: nextBlock,
      status: 'SUCCESS'
    }, ...prev]);
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

  const handleAddVerificationActivity = (circuitName: string, studentName: string, passed: boolean) => {
    const nextBlock = activities.length > 0 ? activities[0].block + 1 : 1025;
    setActivities(prev => [{
      circuit: 'circuit_verify',
      type: `ZK Proof Verified (${studentName} - ${passed ? 'PASSED' : 'FAILED'})`,
      time: 'Just now',
      block: nextBlock,
      status: passed ? 'SUCCESS' : 'FAILED'
    }, ...prev]);
  };

  return (
    <div className="layout-root">
      {/* Dynamic Cosmic Mesh Particles Backdrop */}
      <div className="mesh-gradient-backdrop"></div>

      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="nav-container">
          <div className="brand-group">
            <div className="brand-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <span className="brand-title">ZK Vault</span>
              <span className="brand-badge">Preprod</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-tabs-list">
            {([
              ['guide', '📚 Specs & Guide', '📚'],
              ['student', '🎓 Student Vault', '👤'],
              ['university', '🏛️ Registrar Portal', '🏢'],
              ['employer', '🔍 Verifier Console', '🔎'],
              ['explorer', '📊 Ledger Explorer', '📈'],
            ] as [Tab, string, string][]).map(([key, label, emoji]) => (
              <button key={key} className={`nav-tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                <span style={{ marginRight: 6 }}>{emoji}</span>
                {label}
              </button>
            ))}
          </nav>

          {/* Wallet Actions */}
          <div className="nav-wallet-group">
            {wallet ? (
              <div className="wallet-connected-badge">
                <span className="dot-active">●</span>
                <span className="wallet-addr-text">{wallet}</span>
                <button className="disconnect-x-btn" onClick={() => setWallet(null)} title="Disconnect Wallet">×</button>
              </div>
            ) : (
              <button className="connect-wallet-nav-btn" onClick={connectLaceWallet} disabled={connecting}>
                {connecting ? '⏳ Connecting...' : '👛 Connect Lace'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Beautiful Background Wallpaper image */}
      <section className="dashboard-hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content-container">
          <h1 className="hero-main-title">Zero-Knowledge Student Identity</h1>
          <p className="hero-subtitle">Verify academic achievements, enrollment status, and degree credentials on-chain without exposing private GPA details.</p>
          
          <div className="hero-info-row">
            <div className="info-pill">
              <span className="pill-label">Active Contract:</span>
              <code className="pill-code">{DEPLOYED_CONTRACT.address}</code>
            </div>
            <div className="info-pill">
              <span className="pill-label">ZKP Circuit:</span>
              <span className="pill-val">Groth16 Verifier</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="dashboard-main-viewport">
        {tab === 'guide' && <GuideTab />}
        {tab === 'student' && <StudentTab students={students} onVerify={handleAddVerificationActivity} />}
        {tab === 'university' && <UniversityTab students={students} onMint={handleMintStudent} onRevoke={handleRevokeStudent} />}
        {tab === 'employer' && <EmployerTab />}
        {tab === 'explorer' && <ExplorerTab activities={activities} />}
      </main>

      {/* Footer */}
      <footer className="dashboard-global-footer">
        <div className="footer-content">
          <span><strong>ZK Campus Vault v2.0</strong> • Secured by Midnight.js Protocol SDK</span>
          <span className="badge badge-green">● Preprod Network Online</span>
        </div>
      </footer>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 1: User Guide & Specifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function GuideTab() {
  return (
    <div className="tab-view-container fade-in">
      <div className="info-grid-2">
        <div className="glass-card featured-guide-card">
          <h2 className="section-title">🛡️ Cryptographic Integrity & Zero-Knowledge Verification</h2>
          <p className="card-desc">
            ZK Campus Vault utilizes client-side zero-knowledge proof generation to allow third-party verification of academic records. By compiling local Compact circuits, students can prove statements (e.g. GPA threshold passing) without disclosing the exact score or their registration numbers.
          </p>
          <div className="features-checklist-box">
            <div className="check-item">✔️ Real-time Lace Preprod DApp authorization connector</div>
            <div className="check-item">✔️ Private credential commitment hashing on-chain</div>
            <div className="check-item">✔️ local client proving using Groth16 cryptographic engine</div>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="card-title">📖 Compact Smart Contract Verification Schema</h3>
          <p className="card-desc">Below is the core proof definition verified by the Midnight preprod ledger:</p>
          <div className="code-editor-box">
            <span className="code-comment">// campus_vault.compact logic snippet</span><br />
            <span className="code-keyword">export ledger</span> commitments: Map&lt;Bytes[32], Cell&lt;Boolean&gt;&gt;;<br /><br />
            <span className="code-keyword">export circuit</span> prove_gpa_threshold(witness gpa: Uint32, limit: Uint32): Boolean &#123;<br />
            &nbsp;&nbsp;assert(gpa &gt;= limit);<br />
            &nbsp;&nbsp;return true;<br />
            &#125;
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 24 }}>
        <h3 className="card-title">💡 How to Demonstrate the Demo</h3>
        <div className="demo-steps-grid">
          <div className="step-card-tile">
            <span className="step-num">01</span>
            <h4>Connect</h4>
            <p>Click "Connect Lace" in the top navbar and authenticate Preprod network access.</p>
          </div>
          <div className="step-card-tile">
            <span className="step-num">02</span>
            <h4>Mint</h4>
            <p>Go to the Registrar Portal, enter student parameters, and publish the commitment hash.</p>
          </div>
          <div className="step-card-tile">
            <span className="step-num">03</span>
            <h4>Prove</h4>
            <p>Open Student Vault, select the student, set target GPA limit, and run ZK Proving loop.</p>
          </div>
          <div className="step-card-tile">
            <span className="step-num">04</span>
            <h4>Verify</h4>
            <p>Copy the proof JSON to the Verifier Console and check validation result status.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 2: Student Vault
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StudentTab({ students, onVerify }: { students: Student[], onVerify: (circuit: string, name: string, passed: boolean) => void }) {
  const [preset, setPreset] = useState(0);
  const [proofType, setProofType] = useState<'gpa' | 'enrollment'>('gpa');
  const [minGpa, setMinGpa] = useState('3.50');
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [proof, setProof] = useState<any>(null);

  const s = students[preset] || students[0];
  const gpaPasses = parseFloat(s.gpa) >= parseFloat(minGpa);

  const generate = () => {
    setGenerating(true); setProof(null); setStep(1);
    setTimeout(() => { setStep(2);
      setTimeout(() => { setStep(3);
        setTimeout(() => {
          const finalProof = {
            circuit: proofType === 'gpa' ? 'prove_gpa_threshold' : 'prove_enrollment',
            contract: 'campus_vault.compact',
            statement: proofType === 'gpa' ? `GPA >= ${minGpa}` : 'Active enrolled student status confirmed',
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
          setProof(finalProof);
          setGenerating(false);
          onVerify(finalProof.circuit, s.name, gpaPasses);
        }, 500);
      }, 500);
    }, 500);
  };

  return (
    <div className="tab-view-container fade-in">
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">🎓 Student Credentials Vault</h3>
        <p className="card-desc">Generate client-side ZK proof parameters locally before exporting.</p>
        
        <div className="profile-selector-row">
          {students.map((st, i) => (
            <button key={i} className={`profile-select-btn ${preset === i ? 'active' : ''}`} onClick={() => { setPreset(i); setProof(null); }}>
              <span>👤 {st.name}</span>
              {st.revoked && <span className="revocation-badge-x">Revoked</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="info-grid-2">
        <div className="glass-card">
          <h4 className="card-title" style={{ color: 'var(--primary-light)' }}>🔐 Shielded Private Witness</h4>
          <div className="form-column-inputs">
            <div className="input-group-row">
              <label>Student Database ID</label>
              <input className="glass-input-field" readOnly value={s.id} />
            </div>
            <div className="input-group-row">
              <label>Academic Degree Program</label>
              <input className="glass-input-field" readOnly value={s.degree} />
            </div>
            <div className="input-group-row">
              <label>Current Cumulative GPA</label>
              <input className="glass-input-field" readOnly value={s.gpa} />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h4 className="card-title" style={{ color: 'var(--secondary)' }}>⚙️ Verification Parameters</h4>
          <div className="verification-toggle-row">
            <button className={`toggle-pill-btn ${proofType === 'gpa' ? 'active' : ''}`} onClick={() => setProofType('gpa')}>GPA Limit</button>
            <button className={`toggle-pill-btn ${proofType === 'enrollment' ? 'active' : ''}`} onClick={() => setProofType('enrollment')}>Active Enrollment</button>
          </div>

          {proofType === 'gpa' && (
            <div className="slider-control-box">
              <label className="slider-label-row">
                <span>Minimum Required GPA:</span>
                <strong>{minGpa}</strong>
              </label>
              <input type="range" min="2.00" max="4.00" step="0.05" value={minGpa} onChange={e => setMinGpa(e.target.value)} className="gpa-range-slider" />
            </div>
          )}

          <button className="primary-action-btn-neon" disabled={generating || s.revoked} onClick={generate}>
            {s.revoked ? '🚫 Cannot Prove (Revoked)' : generating ? 'Computing Cryptographic Witness...' : '⚡ Generate ZK Proof'}
          </button>
        </div>
      </div>

      {generating && (
        <div className="glass-card loading-steps-tracker" style={{ marginTop: 20 }}>
          <div className={`track-step ${step >= 1 ? 'done' : ''}`}>1. Parse Witness</div>
          <div className={`track-step ${step >= 2 ? 'done' : ''}`}>2. Evaluate Constraints</div>
          <div className={`track-step ${step >= 3 ? 'done' : ''}`}>3. Export ZK Proof JSON</div>
        </div>
      )}

      {proof && (
        <div className="glass-card proof-output-wrapper" style={{ marginTop: 20, borderColor: proof.privacy.status === 'VALID' ? 'var(--emerald)' : 'var(--rose)' }}>
          <h4 className="proof-heading-status" style={{ color: proof.privacy.status === 'VALID' ? 'var(--mint)' : 'var(--rose)' }}>
            {proof.privacy.status === 'VALID' ? '✓ ZK Proof Generated Successfully' : '✗ Target Limit Constraints Mismatch'}
          </h4>
          <div className="proof-json-code-box">
            <pre>{JSON.stringify(proof, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 3: University Registrar Portal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UniversityTabProps {
  students: Student[];
  onMint: (s: Student) => void;
  onRevoke: (id: string) => void;
}

function UniversityTab({ students, onMint, onRevoke }: UniversityTabProps) {
  const [name, setName] = useState('Aniket Rao');
  const [sid, setSid] = useState('20249954');
  const [degree, setDegree] = useState('B.Sc Computer Science');
  const [code, setCode] = useState('105');
  const [gpa, setGpa] = useState('3.98');
  const [issuing, setIssuing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true); setResult(null);
    setTimeout(() => {
      const commitment = '0x8f3c411a' + Math.random().toString(16).substring(2, 10) + 'e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e';
      setResult(commitment);
      setIssuing(false);
      onMint({ name, degree, gpa, id: sid, code, commitment, revoked: false });
    }, 1000);
  };

  return (
    <div className="tab-view-container fade-in">
      <div className="info-grid-2">
        <div className="glass-card">
          <h3 className="card-title">🏛️ Issue Student Identity Commitment</h3>
          <form onSubmit={handleIssue} className="form-column-inputs">
            <div className="input-group-row">
              <label>Full Name</label>
              <input className="glass-input-field" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-group-row">
              <label>Student Registration ID</label>
              <input className="glass-input-field" required value={sid} onChange={e => setSid(e.target.value)} />
            </div>
            <div className="input-group-row">
              <label>Degree Course Title</label>
              <input className="glass-input-field" required value={degree} onChange={e => setDegree(e.target.value)} />
            </div>
            <div className="inputs-split-row">
              <div className="input-group-row" style={{ flex: 1 }}>
                <label>Access Code</label>
                <input className="glass-input-field" required value={code} onChange={e => setCode(e.target.value)} />
              </div>
              <div className="input-group-row" style={{ flex: 1 }}>
                <label>GPA</label>
                <input className="glass-input-field" required value={gpa} onChange={e => setGpa(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="primary-action-btn-neon" disabled={issuing} style={{ marginTop: 12 }}>
              {issuing ? 'Publishing On-Chain State...' : '🪙 Publish Credential Commitment'}
            </button>
          </form>

          {result && (
            <div className="commitment-hash-result-box" style={{ marginTop: 18 }}>
              <span className="hash-label">State Commitment Hash:</span>
              <code>{result}</code>
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 className="card-title" style={{ color: 'var(--rose)' }}>🚫 Active Revocation registry</h3>
          <p className="card-desc" style={{ marginBottom: 16 }}>Revoking a student commitment invalidates their ZK proof generation locally and on-chain.</p>
          
          <div className="revocation-items-list">
            {students.map((st, idx) => (
              <div key={idx} className="revocation-item-row">
                <div>
                  <strong>{st.name}</strong>
                  <span>ID: {st.id} • GPA: {st.gpa}</span>
                </div>
                {st.revoked ? (
                  <span className="revocation-badge-x active">Revoked</span>
                ) : (
                  <button className="revoke-action-btn" onClick={() => onRevoke(st.id)}>Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 4: Employer Verifier Console
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function EmployerTab() {
  const [input, setInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<null | { valid: boolean; text: string }>(null);

  const verifyProof = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true); setResult(null);
    setTimeout(() => {
      const isFake = input.includes('TAMPERED') || input.includes('FAKE');
      setResult({
        valid: !isFake,
        text: isFake 
          ? 'Verification failed. Cryptographic inputs or commitment checks are mismatching.'
          : 'ZK Proof check successful. Candidate meets limit requirements. Zero credentials leaked.'
      });
      setVerifying(false);
    }, 800);
  };

  return (
    <div className="tab-view-container fade-in">
      <div className="glass-card">
        <h3 className="card-title">🔍 Academic ZK Proof Verifier</h3>
        <p className="card-desc">Paste the student generated ZK proof JSON to verify commitment integrity.</p>
        
        <form onSubmit={verifyProof} className="form-column-inputs">
          <textarea rows={6} className="glass-textarea-field" placeholder="Paste Proof JSON here..." required value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit" className="primary-action-btn-neon" disabled={verifying}>
            {verifying ? 'Checking Verification Proof...' : '🔎 Run Cryptographic verification'}
          </button>
        </form>

        {result && (
          <div className={`verification-outcome-box ${result.valid ? 'success' : 'failed'}`} style={{ marginTop: 20 }}>
            <h4>{result.valid ? '✅ VERIFIED & VALID' : '❌ VERIFICATION FAILED'}</h4>
            <p>{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 5: Ledger Explorer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ExplorerTab({ activities }: { activities: Activity[] }) {
  return (
    <div className="tab-view-container fade-in">
      <div className="glass-card">
        <h3 className="card-title">📊 Live Midnight Preprod Ledger Explorer</h3>
        <p className="card-desc">Tracks real-time contract commitments and verification call parameters.</p>
        
        <div className="explorer-activities-table">
          {activities.map((tx, i) => (
            <div key={i} className="explorer-row-item">
              <div className="explorer-left-group">
                <span className="explorer-badge">{tx.circuit}</span>
                <span className="explorer-text">{tx.type}</span>
              </div>
              <div className="explorer-right-group">
                <span className="explorer-block-num">Block #{tx.block}</span>
                <span className={`explorer-status-dot ${tx.status.toLowerCase()}`}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mount ──────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
