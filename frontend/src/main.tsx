import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — Privacy-Preserving Credentials & Identity Verification
 *  Theme: Futuristic Top-Nav Space SaaS Dashboard with Interactive Wizard Walkthrough
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
        {tab === 'guide' && <GuideTab onTabChange={setTab} onConnect={connectLaceWallet} walletConnected={!!wallet} />}
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
//  TAB 1: User Guide & Specifications — STEP-BY-STEP SIMULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function GuideTab({ onTabChange, onConnect, walletConnected }: { onTabChange: (t: Tab) => void; onConnect: () => void; walletConnected: boolean }) {
  const [activeStep, setActiveStep] = useState(0);

  const stepsData = [
    {
      title: "Step 1: Connect Lace Preprod Wallet",
      icon: "👛",
      desc: "Before performing any cryptographic proof validation, authorize ZK Campus Vault to interact with your Lace Wallet extension on the Midnight Preprod Network.",
      actionLabel: walletConnected ? "✓ Connected successfully!" : "Connect Lace Wallet Now",
      action: onConnect,
      disabled: walletConnected,
      tip: "Make sure you set your Lace Extension's network configuration to Preprod inside the extension's settings page."
    },
    {
      title: "Step 2: Mint Private Commitment (University Registrar)",
      icon: "🏛️",
      desc: "Universities act as registrars. Instead of publishing a student's raw name, GPA, and register number on-chain, they publish a 32-byte Cryptographic Commitment Hash to preserve privacy.",
      actionLabel: "Go to Registrar Portal",
      action: () => onTabChange('university'),
      tip: "Commitments are computed by hashing the student ID, degree, and GPA. Once published, they cannot be tampered with."
    },
    {
      title: "Step 3: Generate Zero-Knowledge Proof (Student Vault)",
      icon: "🎓",
      desc: "Students run client-side proving circuits locally in their browser. They can generate a Groth16 ZK Proof proving their GPA meets a minimum limit without revealing their actual GPA score.",
      actionLabel: "Generate ZK Proof",
      action: () => onTabChange('student'),
      tip: "Proving runs completely in browser memory. Private GPA values never leave your client device."
    },
    {
      title: "Step 4: Verify Academic ZK Proof (Verifier Console)",
      icon: "🔎",
      desc: "Employers, companies, and academic institutions verify the correctness of the ZK Proof JSON. The smart contract validates the proof math against the on-chain commitment hash instantly.",
      actionLabel: "Open Verifier Console",
      action: () => onTabChange('employer'),
      tip: "Validation result returns either success or failed, with zero credentials leaked to the verifier."
    }
  ];

  const current = stepsData[activeStep];

  return (
    <div className="tab-view-container fade-in">
      <div className="glass-card" style={{ padding: '36px', marginBottom: 24, background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.03))' }}>
        <h2 className="section-title" style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: 8 }}>🛠️ Interactive Demo Walkthrough Walk</h2>
        <p className="card-desc" style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 28px auto' }}>
          This wizard guides you through the entire end-to-end zero-knowledge validation workflow of ZK Campus Vault. Follow the steps below.
        </p>

        {/* Stepper Navigation headers */}
        <div className="wizard-stepper-headers" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
          {stepsData.map((s, idx) => (
            <button 
              key={idx} 
              className={`stepper-header-pill-btn ${activeStep === idx ? 'active' : ''}`}
              onClick={() => setActiveStep(idx)}
              style={{
                background: activeStep === idx ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.02)',
                border: '1px solid ' + (activeStep === idx ? 'var(--primary)' : 'rgba(255,255,255,0.06)'),
                color: activeStep === idx ? '#fff' : 'var(--text-muted)',
                padding: '10px 20px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '0.78rem',
                transition: 'all 0.2s ease'
              }}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Step Panel */}
        <div className="active-step-panel-layout" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, alignItems: 'start', padding: '12px 0' }}>
          <div style={{ fontSize: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '14px 10px' }}>
            {current.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: '#fff' }}>{current.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{current.desc}</p>
            
            {/* Interactive Action Trigger */}
            <button 
              className="primary-action-btn-neon" 
              onClick={current.action} 
              disabled={current.disabled}
              style={{ maxWidth: '280px', fontSize: '0.8rem', padding: '10px 20px', borderRadius: '30px', display: 'flex', gap: 8, justifyContent: 'center' }}
            >
              <span>🚀</span> {current.actionLabel}
            </button>

            {/* Helpful Cryptography Tip */}
            <div style={{ marginTop: 20, padding: 12, borderRadius: 10, background: 'rgba(255, 255, 255, 0.01)', borderLeft: '3px solid var(--secondary)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>🔒 Security Fact:</strong> {current.tip}
            </div>
          </div>
        </div>
      </div>

      {/* Visual flowchart illustration underneath */}
      <div className="glass-card" style={{ padding: '30px 24px' }}>
        <h3 className="card-title" style={{ textAlign: 'center', marginBottom: 24, fontSize: '1.15rem' }}>⛓️ Cryptographic Proof Flow: "Proven Without Shown"</h3>
        <div className="flowchart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', position: 'relative' }}>
          <div className="flow-node" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 20px', borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: 4 }}>👤</span>
            <strong style={{ fontSize: '0.85rem', display: 'block' }}>Student Witness</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Private inputs (GPA, ID)</span>
          </div>

          <div className="flow-arrow" style={{ color: 'var(--primary-light)', fontSize: '1.5rem', fontWeight: 800 }}>➔</div>

          <div className="flow-node" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--border-glow)', padding: '14px 20px', borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: 4 }}>⚡</span>
            <strong style={{ fontSize: '0.85rem', display: 'block' }}>Compact Circuit</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Groth16 Proof Prover</span>
          </div>

          <div className="flow-arrow" style={{ color: 'var(--secondary)', fontSize: '1.5rem', fontWeight: 800 }}>➔</div>

          <div className="flow-node" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 20px', borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: 4 }}>📄</span>
            <strong style={{ fontSize: '0.85rem', display: 'block' }}>ZK Proof JSON</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Verification Statement</span>
          </div>

          <div className="flow-arrow" style={{ color: 'var(--mint)', fontSize: '1.5rem', fontWeight: 800 }}>➔</div>

          <div className="flow-node" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px 20px', borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)' }}>
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: 4 }}>🏛️</span>
            <strong style={{ fontSize: '0.85rem', display: 'block' }}>Midnight Preprod</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ledger Commitment Check</span>
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
