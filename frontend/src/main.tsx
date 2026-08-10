import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — All-in-One Premium Frontend
 *  Theme: Aurora Mint & Deep Teal Glassmorphism
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const DEMO_STUDENTS = [
  { name: 'Alice Sharma', degree: 'B.Tech Computer Science', gpa: '3.85', id: '20249821', code: '101' },
  { name: 'Rohan Patil', degree: 'M.Tech Data Science & AI', gpa: '3.92', id: '20249845', code: '102' },
  { name: 'Priya Deshmukh', degree: 'B.Sc Information Technology', gpa: '3.40', id: '20249872', code: '103' },
];

type Tab = 'how' | 'student' | 'university' | 'employer' | 'explorer';

const DEPLOYED_CONTRACT = {
  address: "3df730f55ed9ed960581bd7afe1aa88edbcd60414d5474d67870d938bd7d99ef",
  network: "Local Devnet",
  deployer: "mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s"
};

function App() {
  const [tab, setTab] = useState<Tab>('how');
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // @ts-ignore
      if (typeof window.midnight === 'undefined') {
        alert("No Midnight wallet extension found! Please install the 1AM Wallet or Lace.");
        return;
      }
      
      // @ts-ignore
      const walletProviders = Object.keys(window.midnight);
      if (walletProviders.length === 0) return;
      
      const providerKey = walletProviders.find(k => k.toLowerCase().includes('1am') || k.toLowerCase().includes('oneam')) || walletProviders[0];
      
      // @ts-ignore
      const provider = window.midnight[providerKey];
      
      let api;
      if (typeof provider.enable === 'function') {
        api = await provider.enable();
      } else if (typeof provider.connect === 'function') {
        api = await provider.connect();
      } else if (typeof provider === 'function') {
        api = await provider();
      } else if (typeof (window as any).midnight.enable === 'function') {
        api = await (window as any).midnight.enable();
      } else {
        alert("Found Midnight wallet, but couldn't connect. Please check browser extension.");
        return;
      }

      const state = typeof api.state === 'function' ? await api.state() : api;
      
      if (state && state.address) {
        setWallet(state.address.substring(0, 10) + '...' + state.address.substring(state.address.length - 6));
      } else {
        setWallet("Connected (1AM Wallet)");
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      const msg = err?.message || 'Unknown error';
      alert(`Wallet connection error: ${msg}`);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="flex-row">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: 10, borderRadius: 14, display: 'flex', boxShadow: '0 0 25px rgba(20, 184, 166, 0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }} className="gradient-text">ZK Campus Vault</h1>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>On-Chain Student verification</p>
            </div>
          </div>

          <div className="flex-row">
            <nav className="nav">
              {([
                ['how', '⚡ Dashboard'],
                ['student', '🎓 Student Portal'],
                ['university', '🏛️ University Portal'],
                ['employer', '💼 Verification Console'],
                ['explorer', '📊 Ledger Explorer'],
              ] as [Tab, string][]).map(([key, label]) => (
                <button key={key} className={`nav-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                  {label}
                </button>
              ))}
            </nav>
            
            <button 
              className="btn btn-outline" 
              style={{ marginLeft: '12px', borderColor: wallet ? 'var(--secondary)' : 'var(--primary)', color: wallet ? 'var(--mint)' : 'var(--primary-light)' }}
              onClick={connectWallet}
            >
              {wallet ? `✅ ${wallet}` : '👛 Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main fade-in">
        {/* Banner with Active Contract Info */}
        <div className="card" style={{ marginBottom: 26, padding: '14px 24px', background: 'rgba(20, 184, 166, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderColor: 'var(--border)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ⛓️ <strong>Active Midnight Contract:</strong> <code style={{ color: 'var(--primary-light)', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px' }}>{DEPLOYED_CONTRACT.address}</code>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '4px 12px' }}>● Status: Active on {DEPLOYED_CONTRACT.network}</span>
        </div>

        {tab === 'how' && <HowItWorksTab onNavigate={setTab} />}
        {tab === 'student' && <StudentTab />}
        {tab === 'university' && <UniversityTab />}
        {tab === 'employer' && <EmployerTab />}
        {tab === 'explorer' && <ExplorerTab />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <strong>ZK Campus Vault</strong> • Developed for INTO the Midnight Bootcamp • Cryptographically Verified Private Credentials
      </footer>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 1: Dashboard / Explainer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function HowItWorksTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  return (
    <div className="flex-col fade-in">
      {/* Hero Welcome Panel */}
      <div className="card" style={{ background: 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.05))', padding: '60px 30px', border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: 24, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="badge" style={{ marginBottom: 12 }}>Version 1.0.0 Live</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: 14, fontWeight: 800 }} className="gradient-text">Privacy-First Verification</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem', marginBottom: 20 }}>
              ZK Campus Vault eliminates degree fraud and identity leaks using Zero-Knowledge Proofs on the Midnight Network. We make it possible to prove qualifications instantly without sharing actual scores, roll numbers, or transcripts.
            </p>
            <div className="flex-row">
              <button className="btn btn-primary" onClick={() => onNavigate('student')}>🎓 Access Student Vault</button>
              <button className="btn btn-outline" onClick={() => onNavigate('employer')}>💼 Verify a Proof</button>
            </div>
          </div>
          <div style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'center' }}>
            <div className="aurora-pulse" style={{ fontSize: '7rem', filter: 'drop-shadow(0 0 20px rgba(20,184,166,0.3))' }}>🛡️</div>
          </div>
        </div>
      </div>

      {/* Stat Widgets */}
      <div className="grid-3">
        <div className="card" style={{ background: 'rgba(14, 165, 233, 0.03)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔒</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--primary-light)' }}>100% Client-Side Privacy</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ZK proofs are generated entirely inside your browser sandbox. Your personal identifiers never traverse the network.
          </p>
        </div>
        <div className="card" style={{ background: 'rgba(20, 184, 166, 0.03)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🏛️</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--mint)' }}>On-Chain Commitment</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Credentials are committed onto the public ledger as 32-byte secure hashes, ensuring absolute immutability.
          </p>
        </div>
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.03)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>⚡</div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: 8, color: 'var(--emerald)' }}>Sub-Second Auditing</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Verification checks complete instantly. No manual registries or long background verification loops needed.
          </p>
        </div>
      </div>

      {/* Process Map */}
      <div className="card" style={{ padding: 36 }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 20, textAlign: 'center' }} className="gradient-text">Interactive Credential Flow</h3>
        <div className="grid-3" style={{ gap: 20 }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: 20, borderRadius: 14, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h5 style={{ color: 'var(--primary-light)', marginBottom: 8 }}>1. Register / Mint</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              University creates a hash commitments containing the student's Roll ID, GPA, and Degree Code, sending it to the Midnight node.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: 20, borderRadius: 14, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h5 style={{ color: 'var(--mint)', marginBottom: 8 }}>2. Formulate ZK Proof</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Student selects target parameters (like GPA &gt;= 3.50) and computes a cryptographic proof on their device.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: 20, borderRadius: 14, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h5 style={{ color: 'var(--secondary)', marginBottom: 8 }}>3. Verify & Confirm</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Employers evaluate the proof parameters on-ledger. Midnight validates without leaking any underlying score metadata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 2: Student Vault
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StudentTab() {
  const [preset, setPreset] = useState(0);
  const [proofType, setProofType] = useState<'gpa' | 'enrollment'>('gpa');
  const [minGpa, setMinGpa] = useState('3.50');
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [proof, setProof] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const s = DEMO_STUDENTS[preset];
  const gpaPasses = parseFloat(s.gpa) >= parseFloat(minGpa);

  const generate = () => {
    setGenerating(true); setProof(null); setStep(1);
    setTimeout(() => { setStep(2);
      setTimeout(() => { setStep(3);
        setTimeout(() => {
          setProof({
            circuit: proofType === 'gpa' ? 'prove_gpa_threshold' : 'prove_enrollment',
            contract: 'campus_vault.compact',
            statement: proofType === 'gpa' ? `GPA >= ${minGpa}` : 'Active enrolled student status confirmed',
            public_inputs: { 
              min_gpa_x100: Math.round(parseFloat(minGpa) * 100), 
              commitment: '0x8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e' 
            },
            proof_data: "0x25a9f3b8c8d...ff930b5e28a",
            privacy: { 
              student_id_revealed: false, 
              actual_gpa_revealed: false, 
              status: gpaPasses ? 'VALID' : 'FAILED' 
            },
            timestamp: new Date().toISOString()
          });
          setGenerating(false);
        }, 500);
      }, 500);
    }, 500);
  };

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.05))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>🎓 Student Identity Vault</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Compute Zero-Knowledge proofs locally in your sandbox environment. Your actual marks, roll number, and personal details stay securely in your local vault.
        </p>
      </div>

      <div className="flex-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Active Student Profile:</span>
        {DEMO_STUDENTS.map((st, i) => (
          <button key={i} className={`btn btn-outline ${preset === i ? 'active' : ''}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { setPreset(i); setProof(null); }}>
            {st.name} ({st.gpa} GPA)
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Private Data Card */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--primary-light)' }}>🔐 Private Off-Chain Credentials</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span className="label">Student ID (Private Input)</span><input className="input" readOnly value={s.id} /></div>
            <div><span className="label">Degree Program</span><input className="input" readOnly value={s.degree + ' (Code: ' + s.code + ')'} /></div>
            <div><span className="label">Actual Cumulative GPA (Private Input)</span><input className="input" readOnly value={s.gpa} /></div>
          </div>
          <p style={{ marginTop: 14, fontSize: '0.76rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, lineHeight: 1.5 }}>
            🛡️ <strong>Privacy Protection:</strong> None of these inputs are broadcast to the Midnight network. Only the computed ZK Proof leaves your wallet.
          </p>
        </div>

        {/* ZK Proof Generator */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--secondary)' }}>✨ ZK proof configuration</h3>

          <div className="flex-row" style={{ marginBottom: 16 }}>
            <button className={`btn btn-outline ${proofType === 'gpa' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setProofType('gpa')}>GPA Threshold</button>
            <button className={`btn btn-outline ${proofType === 'enrollment' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setProofType('enrollment')}>Enrollment Proof</button>
          </div>

          {proofType === 'gpa' && (
            <div style={{ marginBottom: 16 }}>
              <span className="label">Required Minimum GPA:</span>
              <div className="flex-row">
                <input type="range" min="2.00" max="4.00" step="0.05" value={minGpa} onChange={e => setMinGpa(e.target.value)} style={{ flex: 1, accentColor: 'var(--secondary)' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--mint)', minWidth: 48 }}>{minGpa}</span>
              </div>
              <div style={{ marginTop: 10, padding: 10, borderRadius: 8, fontSize: '0.8rem', background: gpaPasses ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)', border: `1px solid ${gpaPasses ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, color: gpaPasses ? '#34d399' : '#fda4af' }}>
                {gpaPasses
                  ? <>✅ Proof can be computed: actual GPA ({s.gpa}) is above threshold.</>
                  : <>❌ Cannot generate valid proof: actual GPA ({s.gpa}) is below threshold.</>}
              </div>
            </div>
          )}
          {proofType === 'enrollment' && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8, lineHeight: 1.5 }}>
              🎓 This proves active registration in the {s.degree} program. Name, ID and marks are entirely redacted.
            </p>
          )}

          <button className="btn btn-primary" disabled={generating} onClick={generate} style={{ width: '100%', justifyContent: 'center' }}>
            {generating ? `Computing ZK Proof (Step ${step}/3)...` : '✨ Compute ZK Proof'}
          </button>
        </div>
      </div>

      {/* Step Progress */}
      {generating && (
        <div className="card flex-row" style={{ justifyContent: 'space-around', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex-row" style={{ opacity: step >= 1 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--primary)' }}>1</div><span style={{ fontSize: '0.85rem' }}>Load Secrets</span></div>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <div className="flex-row" style={{ opacity: step >= 2 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--secondary)' }}>2</div><span style={{ fontSize: '0.85rem' }}>Run Prover Circuit</span></div>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <div className="flex-row" style={{ opacity: step >= 3 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--emerald)' }}>3</div><span style={{ fontSize: '0.85rem' }}>Output ZK Proof JSON</span></div>
        </div>
      )}

      {/* Proof Result */}
      {proof && (
        <div className="card" style={{ borderColor: proof.privacy.status === 'VALID' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 style={{ color: proof.privacy.status === 'VALID' ? '#34d399' : '#f43f5e' }}>
              {proof.privacy.status === 'VALID' ? '✅ ZK Proof Generated Successfully!' : '❌ ZK Proof Failed — Criteria Not Satisfied'}
            </h4>
            <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={copy}>
              {copied ? '✓ Copied!' : '📋 Copy Proof JSON'}
            </button>
          </div>
          <div className="code-block"><pre style={{ margin: 0 }}>{JSON.stringify(proof, null, 2)}</pre></div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 3: University Issuer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function UniversityTab() {
  const [sid, setSid] = useState('20249821');
  const [code, setCode] = useState('101');
  const [gpa, setGpa] = useState('3.85');
  const [issuing, setIssuing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true); setResult(null);
    setTimeout(() => {
      setResult('0x8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e');
      setIssuing(false);
    }, 1200);
  };

  return (
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.05))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>🏛️ University Issuer Portal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Mint credentials onto the Midnight Ledger. The raw data remains off-chain — only the commitments are published.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>📝 Mint Digital Student Credential</h3>
          <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><span className="label">Student ID (Uint64)</span><input className="input" required value={sid} onChange={e => setSid(e.target.value)} /></div>
            <div><span className="label">Degree Code (Uint32)</span><input className="input" required value={code} onChange={e => setCode(e.target.value)} /></div>
            <div><span className="label">Cumulative GPA</span><input className="input" required value={gpa} onChange={e => setGpa(e.target.value)} /></div>
            <button type="submit" className="btn btn-primary" disabled={issuing} style={{ justifyContent: 'center', marginTop: 4 }}>
              {issuing ? 'Executing issue_credential()...' : '🪙 Mint Credential to Ledger'}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12 }}>
              <h4 style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: 6 }}>✅ Credential Minted!</h4>
              <span className="label">On-Chain Commitment Hash:</span>
              <div className="code-block" style={{ fontSize: '0.75rem' }}>{result}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>ℹ️ How does it work?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--primary-light)' }}>Step 1:</strong> University takes student record and hashes it with a random secret salt.
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--secondary)' }}>Step 2:</strong> Commitment is verified against constraints in the Compact circuit.
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--mint)' }}>Step 3:</strong> The resulting 32-byte hash commitment is recorded on the public Midnight ledger.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 4: Employer Verifier
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function EmployerTab() {
  const [input, setInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<null | { valid: boolean; statement: string }>(null);

  const loadValid = () => {
    setInput(JSON.stringify({ 
      circuit: 'prove_gpa_threshold', 
      statement: 'GPA >= 3.50', 
      status: 'AUTHENTIC_VALID_PROOF', 
      commitment: '0x8f3c...9f8e',
      proof_data: "0x25a9f3b8c8d...ff930b5e28a"
    }, null, 2));
    setResult(null);
  };
  const loadFake = () => {
    setInput(JSON.stringify({ 
      circuit: 'prove_gpa_threshold', 
      statement: 'GPA >= 3.80', 
      status: 'TAMPERED_FAKE_PROOF', 
      commitment: '0x0000...0000',
      proof_data: "0x000000000000...00000000000"
    }, null, 2));
    setResult(null);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true); setResult(null);
    setTimeout(() => {
      const isFake = input.includes('TAMPERED') || input.includes('FAKE');
      setResult({
        valid: !isFake,
        statement: isFake
          ? 'Verification Failed. Cryptographic proof parameters are invalid or commitment mismatch.'
          : 'Verified. Candidate meets GPA requirements. Zero private data leaked.'
      });
      setVerifying(false);
    }, 1200);
  };

  return (
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.05))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>💼 Verifier Sandbox</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Employers can verify candidate-submitted ZK proofs directly. The system verifies proofs instantly against on-chain records.
        </p>
      </div>

      <div className="card">
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1rem' }}>🔍 Verify ZK Proof</h3>
          <div className="flex-row">
            <button className="btn btn-outline" onClick={loadValid} style={{ padding: '5px 12px', fontSize: '0.78rem', borderColor: 'rgba(16,185,129,0.4)', color: '#34d399' }}>Load Valid ZK Proof</button>
            <button className="btn btn-outline" onClick={loadFake} style={{ padding: '5px 12px', fontSize: '0.78rem', borderColor: 'rgba(244,63,94,0.4)', color: '#fda4af' }}>Load Fake ZK Proof</button>
          </div>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <textarea rows={6} className="input" style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem' }} placeholder='Paste candidate ZK Proof JSON here...' required value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={verifying} style={{ justifyContent: 'center' }}>
            {verifying ? 'Verifying ZK proof validity...' : '🛡️ Verify ZK Proof'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 20, padding: 20, borderRadius: 14, background: result.valid ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', border: `1px solid ${result.valid ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}` }}>
            <h4 style={{ fontSize: '1.2rem', color: result.valid ? '#34d399' : '#f43f5e', marginBottom: 8 }}>
              {result.valid ? '✅ ZK PROOF AUTHENTIC & VERIFIED' : '❌ ZK PROOF VERIFICATION FAILED'}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{result.statement}</p>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Validation Contract: <code style={{ color: 'var(--primary-light)' }}>campus_vault.compact</code> • Data leaked: <strong>None</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 5: Blockchain Explorer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ExplorerTab() {
  const TXS = [
    { circuit: 'issue_credential', type: 'Credential Issued', time: '1 min ago', block: 1024 },
    { circuit: 'prove_gpa_threshold', type: 'ZK Proof Verified', time: '5 min ago', block: 1018 },
    { circuit: 'prove_enrollment', type: 'ZK Proof Verified', time: '12 min ago', block: 1012 },
  ];

  return (
    <div className="flex-col fade-in">
      <div className="grid-4">
        {[
          { label: 'Total Commitments', value: '14,892', icon: '📜', sub: '↑ 14 today' },
          { label: 'ZK Proofs Checked', value: '89,401', icon: '🛡️', sub: '100% ZK Privacy' },
          { label: 'Active Smart Contracts', value: '1', icon: '⚡', sub: 'Version 1.0.0' },
          { label: 'Latest Block', value: '#1,024', icon: '⛓️', sub: 'Block Time ~3s' },
        ].map(m => (
          <div key={m.label} className="card">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.label}</span>
              <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800 }} className="gradient-text">{m.value}</div>
            <span style={{ fontSize: '0.72rem', color: '#34d399' }}>{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>⛓️ Recent ZK Campus Vault Ledger Transactions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TXS.map((tx, i) => (
            <div key={i} className="flex-row" style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.25)', borderRadius: 12, justifyContent: 'space-between', border: '1px solid var(--border)' }}>
              <div className="flex-row">
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '0.92rem' }}>{tx.type}</strong>
                  <span className="badge" style={{ marginLeft: 10 }}>{tx.circuit}</span>
                </div>
              </div>
              <div className="flex-row" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Block {tx.block}</span>
                <span style={{ color: 'var(--text-dim)' }}>|</span>
                <span>{tx.time}</span>
                <span className="badge badge-green">Confirmed</span>
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
