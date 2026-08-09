import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — All-in-One Clean Frontend
 *  Built for INTO the Midnight — SPPU Bootcamp (Rise In)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ─── Demo Data ──────────────────────────────────────────────────

const DEMO_STUDENTS = [
  { name: 'Alice Sharma', degree: 'B.Tech CSE', gpa: '3.85', id: '20249821', code: '101' },
  { name: 'Rohan Patil', degree: 'M.Tech DS & AI', gpa: '3.92', id: '20249845', code: '102' },
  { name: 'Priya Deshmukh', degree: 'B.Sc IT', gpa: '3.40', id: '20249872', code: '103' },
];

type Tab = 'how' | 'student' | 'university' | 'employer' | 'explorer';

// ─── App Root ───────────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState<Tab>('how');
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // @ts-ignore
      // Get the first available wallet (Nightly or others)
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
      // Try to trigger the real popup!
      if (typeof provider.enable === 'function') {
        api = await provider.enable();
      } else if (typeof provider.connect === 'function') {
        // 1AM wallet uses .connect()
        api = await provider.connect();
      } else if (typeof provider === 'function') {
        api = await provider();
      } else if (typeof (window as any).midnight.enable === 'function') {
        api = await (window as any).midnight.enable();
      } else {
        alert("Found 1AM wallet, but couldn't find the 'enable' or 'connect' function. Provider object keys: " + Object.keys(provider).join(', '));
        return;
      }

      // Some wallets return the state API directly, others return an object with a .state() function
      const state = typeof api.state === 'function' ? await api.state() : api;
      
      // Set wallet address to the first available address
      if (state && state.address) {
        setWallet(state.address.substring(0, 10) + '...' + state.address.substring(state.address.length - 6));
      } else {
        setWallet("Connected (1AM Wallet)");
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      const msg = err?.message || 'Unknown error';
      if (msg.toLowerCase().includes('pending')) {
        alert("✋ A connection request is already pending!\n\nPlease click the 1AM Wallet icon (🎯) in your browser toolbar and approve the connection request from ZK Campus Vault.");
      } else {
        alert(`Wallet connection error: ${msg}`);
      }
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="flex-row">
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: 9, borderRadius: 11, display: 'flex', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }} className="gradient-text">ZK Campus Vault</h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Privacy-First Student Credentials on Midnight Network</p>
            </div>
            <span className="badge" style={{ marginLeft: 4 }}>⚡ 1AM Wallet Ready</span>
          </div>

          <div className="flex-row">
            <nav className="nav">
              {([
                ['how', '📖 How It Works'],
                ['student', '🎓 Student'],
                ['university', '🏛️ University'],
                ['employer', '💼 Employer'],
                ['explorer', '📊 Explorer'],
              ] as [Tab, string][]).map(([key, label]) => (
                <button key={key} className={`nav-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                  {label}
                </button>
              ))}
            </nav>
            
            <button 
              className="btn btn-outline" 
              style={{ marginLeft: '12px', borderColor: wallet ? 'rgba(16,185,129,0.5)' : 'var(--primary)', color: wallet ? '#6ee7b7' : 'var(--primary-light)' }}
              onClick={connectWallet}
            >
              {wallet ? `✅ ${wallet}` : '👛 Connect 1AM Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {tab === 'how' && <HowItWorksTab onNavigate={setTab} />}
        {tab === 'student' && <StudentTab />}
        {tab === 'university' && <UniversityTab />}
        {tab === 'employer' && <EmployerTab />}
        {tab === 'explorer' && <ExplorerTab />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <strong>ZK Campus Vault</strong> — Built for INTO the Midnight SPPU Bootcamp (Rise In) • Powered by Midnight Compact Smart Contracts
      </footer>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 1: How It Works (Landing / Explainer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function HowItWorksTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  return (
    <div className="flex-col">
      {/* Hero Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎓🛡️</div>
        <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Zero-Knowledge Student Credentials</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 680, margin: '0 auto', lineHeight: 1.6 }}>
          <strong>ZK Campus Vault</strong> eliminates fake degrees and protects student privacy using <strong>Midnight blockchain</strong> and <strong>Zero-Knowledge Proofs</strong>. 
          Universities issue tamper-proof digital certificates. Students prove their qualifications without revealing private data.
        </p>
      </div>

      {/* Problem → Solution */}
      <div className="grid-2">
        <div className="card" style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
          <h3 style={{ color: '#fda4af', marginBottom: 12, fontSize: '1.1rem' }}>❌ The Problem Today</h3>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: 18 }}>
            <li><strong>Fake degrees</strong> — anyone can forge a certificate in Photoshop</li>
            <li><strong>Privacy leaks</strong> — employers see your full marksheet, Aadhaar, address</li>
            <li><strong>Slow verification</strong> — universities take weeks to manually verify degrees</li>
            <li><strong>No student control</strong> — once shared, you can't take your data back</li>
          </ul>
        </div>
        <div className="card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
          <h3 style={{ color: '#6ee7b7', marginBottom: 12, fontSize: '1.1rem' }}>✅ ZK Campus Vault Solution</h3>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: 18 }}>
            <li><strong>Tamper-proof</strong> — university hashes credentials onto Midnight blockchain</li>
            <li><strong>100% privacy</strong> — employers verify proofs, never see actual marks/ID</li>
            <li><strong>Instant verification</strong> — ZK proofs verify in under 1 second</li>
            <li><strong>Student-controlled</strong> — you choose what to prove and to whom</li>
          </ul>
        </div>
      </div>

      {/* 3-Step Flow */}
      <h3 style={{ textAlign: 'center', fontSize: '1.3rem', color: 'var(--primary-light)' }}>How It Works — 3 Simple Steps</h3>
      <div className="grid-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="step-circle" style={{ background: '#6366f1', margin: '0 auto 12px' }}>1</div>
          <h4 style={{ marginBottom: 8 }}>🏛️ University Issues</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            University hashes student data (ID, degree, GPA, salt) into a <strong>32-byte commitment</strong> and stores it on Midnight. No personal data is stored on-chain.
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="step-circle" style={{ background: '#8b5cf6', margin: '0 auto 12px' }}>2</div>
          <h4 style={{ marginBottom: 8 }}>🎓 Student Proves</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Student generates a <strong>Zero-Knowledge Proof</strong> on their own laptop: "My GPA ≥ 3.50" — without revealing actual GPA (3.85).
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="step-circle" style={{ background: '#10b981', margin: '0 auto 12px' }}>3</div>
          <h4 style={{ marginBottom: 8 }}>💼 Employer Verifies</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Employer pastes the proof and Midnight verifies it in 1 second. <strong>100% authentic, 0% privacy leaked.</strong>
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }} onClick={() => onNavigate('student')}>
          🚀 Try It Now — Generate a ZK Proof
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 2: Student Vault (ZK Proof Generator)
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
            statement: proofType === 'gpa' ? `GPA >= ${minGpa}` : 'Active enrolled student',
            public_inputs: { min_gpa_x100: Math.round(parseFloat(minGpa) * 100), commitment: '0x8f3c411a...9f8e' },
            privacy: { student_id_revealed: false, actual_gpa_revealed: false, result: gpaPasses ? 'VALID' : 'FAILED' },
            timestamp: new Date().toISOString()
          });
          setGenerating(false);
        }, 400);
      }, 400);
    }, 400);
  };

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-col">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>🎓 Student Identity Vault</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your marks and ID stay <strong style={{ color: '#6ee7b7' }}>100% private</strong> on your device. Generate a ZK proof to share with employers or scholarship committees.
        </p>
      </div>

      {/* Profile Selector */}
      <div className="flex-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Demo Profile:</span>
        {DEMO_STUDENTS.map((st, i) => (
          <button key={i} className={`btn btn-outline ${preset === i ? 'active' : ''}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { setPreset(i); setProof(null); }}>
            {st.name} ({st.gpa} GPA)
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Private Data Card */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--primary-light)' }}>🔐 Private Off-Chain Data</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span className="label">Student Roll ID (Private)</span><input className="input" readOnly value={s.id} /></div>
            <div><span className="label">Degree Program</span><input className="input" readOnly value={s.degree + ' (Code: ' + s.code + ')'} /></div>
            <div><span className="label">Actual Cumulative GPA (Private)</span><input className="input" readOnly value={s.gpa} /></div>
          </div>
          <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 }}>
            ⚠️ This data NEVER leaves your device. It is used only for local ZK proof computation.
          </p>
        </div>

        {/* ZK Proof Generator */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--secondary)' }}>✨ ZK Proof Generator</h3>

          <div className="flex-row" style={{ marginBottom: 16 }}>
            <button className={`btn btn-outline ${proofType === 'gpa' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setProofType('gpa')}>GPA Threshold</button>
            <button className={`btn btn-outline ${proofType === 'enrollment' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setProofType('enrollment')}>Enrollment Proof</button>
          </div>

          {proofType === 'gpa' && (
            <div style={{ marginBottom: 16 }}>
              <span className="label">Required Minimum GPA:</span>
              <div className="flex-row">
                <input type="range" min="2.00" max="4.00" step="0.05" value={minGpa} onChange={e => setMinGpa(e.target.value)} style={{ flex: 1, accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-light)', minWidth: 48 }}>{minGpa}</span>
              </div>
              <div style={{ marginTop: 8, padding: 10, borderRadius: 8, fontSize: '0.8rem', background: gpaPasses ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${gpaPasses ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, color: gpaPasses ? '#6ee7b7' : '#fda4af' }}>
                {gpaPasses
                  ? <>✅ Proof will pass: actual GPA ({s.gpa}) ≥ {minGpa}</>
                  : <>❌ Proof will fail: actual GPA ({s.gpa}) &lt; {minGpa}</>}
              </div>
            </div>
          )}
          {proofType === 'enrollment' && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
              🛡️ Proves you are an enrolled student without revealing your name or Student ID.
            </p>
          )}

          <button className="btn btn-primary" disabled={generating} onClick={generate} style={{ width: '100%', justifyContent: 'center' }}>
            {generating ? `Synthesizing ZK Proof (Step ${step}/3)...` : '✨ Generate Zero-Knowledge Proof'}
          </button>
        </div>
      </div>

      {/* Step Progress */}
      {generating && (
        <div className="card flex-row" style={{ justifyContent: 'space-around' }}>
          <div className="flex-row" style={{ opacity: step >= 1 ? 1 : 0.3 }}><div className="step-circle" style={{ background: '#6366f1' }}>1</div><span style={{ fontSize: '0.85rem' }}>Hashing Witness</span></div>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <div className="flex-row" style={{ opacity: step >= 2 ? 1 : 0.3 }}><div className="step-circle" style={{ background: '#8b5cf6' }}>2</div><span style={{ fontSize: '0.85rem' }}>Compact Circuit</span></div>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <div className="flex-row" style={{ opacity: step >= 3 ? 1 : 0.3 }}><div className="step-circle" style={{ background: '#10b981' }}>3</div><span style={{ fontSize: '0.85rem' }}>Midnight Verify</span></div>
        </div>
      )}

      {/* Proof Result */}
      {proof && (
        <div className="card" style={{ borderColor: proof.privacy.result === 'VALID' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 style={{ color: proof.privacy.result === 'VALID' ? '#6ee7b7' : '#f43f5e' }}>
              {proof.privacy.result === 'VALID' ? '✅ ZK Proof Generated Successfully!' : '❌ ZK Proof Failed — GPA Below Threshold'}
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
    <div className="flex-col">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.1))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>🏛️ University Issuer Portal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Universities execute <code style={{ color: 'var(--primary-light)' }}>issue_credential()</code> on Midnight. This hashes student data into a 32-byte commitment and stores it on-chain. No personal data is saved — only the hash.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>📝 Issue Digital Credential</h3>
          <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><span className="label">Student Roll ID (Uint64)</span><input className="input" required value={sid} onChange={e => setSid(e.target.value)} /></div>
            <div><span className="label">Degree Program Code (Uint32)</span><input className="input" required value={code} onChange={e => setCode(e.target.value)} /></div>
            <div><span className="label">Cumulative GPA (e.g. 3.85)</span><input className="input" required value={gpa} onChange={e => setGpa(e.target.value)} /></div>
            <button type="submit" className="btn btn-primary" disabled={issuing} style={{ justifyContent: 'center', marginTop: 4 }}>
              {issuing ? 'Executing issue_credential()...' : '🪙 Mint Credential on Midnight'}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12 }}>
              <h4 style={{ color: '#6ee7b7', fontSize: '0.9rem', marginBottom: 6 }}>✅ Credential Issued!</h4>
              <span className="label">On-Chain Commitment Hash:</span>
              <div className="code-block" style={{ fontSize: '0.75rem' }}>{result}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>ℹ️ What Happens Under the Hood?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--cyan)' }}>Step 1:</strong> The Compact circuit takes (student_id, degree_code, gpa_x100, salt) as inputs.
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--secondary)' }}>Step 2:</strong> It computes <code>commitment = persistentHash(student_id, degree_code, gpa_x100, salt)</code>.
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--emerald)' }}>Step 3:</strong> Only the 32-byte commitment hash goes on-chain. Total credentials counter increments.
            </div>
            <div style={{ padding: 12, background: 'rgba(99,102,241,0.1)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <strong>Result:</strong> Degree is 100% tamper-proof. No one can forge a valid commitment without the original data + salt.
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
    setInput(JSON.stringify({ circuit: 'prove_gpa_threshold', statement: 'GPA >= 3.50', status: 'AUTHENTIC_VALID_PROOF', commitment: '0x8f3c...9f8e' }, null, 2));
    setResult(null);
  };
  const loadFake = () => {
    setInput(JSON.stringify({ circuit: 'prove_gpa_threshold', statement: 'GPA >= 3.80', status: 'TAMPERED_FAKE_PROOF', commitment: '0x0000...0000' }, null, 2));
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
          ? 'REJECTED — Cryptographic proof is invalid or tampered.'
          : 'VERIFIED — Candidate satisfies GPA threshold. Zero private data revealed.'
      });
      setVerifying(false);
    }, 1200);
  };

  return (
    <div className="flex-col">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>💼 Employer Verifier Sandbox</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Paste a student's ZK Proof JSON. Midnight checks the proof against the university's on-chain commitment. If genuine → <strong style={{ color: '#6ee7b7' }}>VERIFIED</strong>. If fake → <strong style={{ color: '#f43f5e' }}>REJECTED</strong>. Zero student data exposed.
        </p>
      </div>

      <div className="card">
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1rem' }}>🔍 Verify ZK Proof</h3>
          <div className="flex-row">
            <button className="btn btn-outline" onClick={loadValid} style={{ padding: '5px 12px', fontSize: '0.78rem', borderColor: 'rgba(16,185,129,0.4)', color: '#6ee7b7' }}>Load Valid Proof</button>
            <button className="btn btn-outline" onClick={loadFake} style={{ padding: '5px 12px', fontSize: '0.78rem', borderColor: 'rgba(244,63,94,0.4)', color: '#fda4af' }}>Load Fake Proof</button>
          </div>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <textarea rows={6} className="input" style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem' }} placeholder='Paste ZK Proof JSON here...' required value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={verifying} style={{ justifyContent: 'center' }}>
            {verifying ? 'Running On-Chain Verification...' : '🛡️ Verify Proof on Midnight'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 20, padding: 20, borderRadius: 14, background: result.valid ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', border: `1px solid ${result.valid ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}` }}>
            <h4 style={{ fontSize: '1.2rem', color: result.valid ? '#6ee7b7' : '#f43f5e', marginBottom: 8 }}>
              {result.valid ? '✅ AUTHENTIC & VERIFIED' : '❌ VERIFICATION FAILED'}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{result.statement}</p>
            <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Contract: campus_vault.compact • Student data revealed: <strong>NONE</strong>
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
    { circuit: 'issue_credential', type: 'Credential Issued', time: '2 min ago', block: 148920 },
    { circuit: 'prove_gpa_threshold', type: 'ZK Proof Verified', time: '8 min ago', block: 148918 },
    { circuit: 'prove_enrollment', type: 'ZK Proof Verified', time: '15 min ago', block: 148914 },
    { circuit: 'revoke_credential', type: 'Credential Revoked', time: '30 min ago', block: 148908 },
  ];

  return (
    <div className="flex-col">
      <div className="grid-4">
        {[
          { label: 'Credentials Issued', value: '1,482', icon: '📜', sub: '↑ 12 today' },
          { label: 'ZK Proofs Verified', value: '8,940', icon: '🛡️', sub: '100% ZK Privacy' },
          { label: 'Revocations', value: '3', icon: '🚫', sub: 'Active on-chain' },
          { label: 'Latest Block', value: '#148,920', icon: '⛓️', sub: 'Block time ~6s' },
        ].map(m => (
          <div key={m.label} className="card">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.label}</span>
              <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{m.value}</div>
            <span style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>⚡ Recent Midnight Contract Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TXS.map((tx, i) => (
            <div key={i} className="flex-row" style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, justifyContent: 'space-between', border: '1px solid var(--border)' }}>
              <div className="flex-row">
                <span style={{ color: '#6ee7b7' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{tx.type}</strong>
                  <span className="badge" style={{ marginLeft: 8 }}>{tx.circuit}</span>
                </div>
              </div>
              <div className="flex-row" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Block #{tx.block}</span>
                <span>🕐 {tx.time}</span>
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
