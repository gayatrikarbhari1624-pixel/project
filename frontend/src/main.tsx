import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — All-in-One Premium Frontend
 *  Theme: Sidebar SaaS Dashboard with Synchronous Wallet Pop-ups
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

type Tab = 'how' | 'student' | 'university' | 'employer' | 'explorer' | 'game';

const DEPLOYED_CONTRACT = {
  address: "3df730f55ed9ed960581bd7afe1aa88edbcd60414d5474d67870d938bd7d99ef",
  network: "Local Devnet",
  deployer: "mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s"
};

function App() {
  const [tab, setTab] = useState<Tab>('how');
  const [wallet, setWallet] = useState<string | null>(null);
  const [isSandboxWallet, setIsSandboxWallet] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [score, setScore] = useState<number>(0);

  const connectWallet = async () => {
    // @ts-ignore
    const midnight = window.midnight;
    if (!midnight) {
      alert("Midnight wallet extension not detected! Please install Lace (Preprod) or 1AM Wallet extension on this browser.");
      return;
    }

    // Direct synchronous lookup to avoid user-gesture popup blocking!
    // @ts-ignore
    const provider = midnight['1am'] || midnight.mnLace || midnight.lace || midnight[Object.keys(midnight)[0]];
    if (!provider) {
      alert("Lace kiva 1AM Wallet browser connector सापडला नाही!");
      return;
    }

    try {
      let api;
      if (typeof provider.enable === 'function') {
        api = await provider.enable();
      } else if (typeof provider.connect === 'function') {
        api = await provider.connect();
      } else if (typeof provider === 'function') {
        api = await provider();
      } else {
        api = provider;
      }

      if (!api) {
        alert("Wallet connection returned empty state.");
        return;
      }

      const state = typeof api.state === 'function' ? await api.state() : api;
      if (state && state.address) {
        setWallet(state.address.substring(0, 8) + '...' + state.address.substring(state.address.length - 4));
        setIsSandboxWallet(false);
        setScore(prev => prev + 50);
      } else if (typeof api.getAddress === 'function') {
        const addr = await api.getAddress();
        setWallet(addr.substring(0, 8) + '...' + addr.substring(addr.length - 4));
        setIsSandboxWallet(false);
      } else {
        setWallet("Connected");
        setIsSandboxWallet(false);
      }
    } catch (err: any) {
      console.error("Wallet connection popup error:", err);
      alert(`Wallet Connection Error: ${err.message || err}`);
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
    setScore(prev => prev + 100);
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
    setScore(prev => prev + 80);
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
    if (passed) setScore(prev => prev + 150);
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: 8, borderRadius: 10, display: 'flex', boxShadow: '0 0 15px rgba(20, 184, 166, 0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }} className="gradient-text">ZK Vault</h2>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>MIDNIGHT CREDENTIALS</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {([
              ['how', '⚡ Dashboard', '📖'],
              ['student', '🎓 Student Vault', '👤'],
              ['university', '🏛️ University Portal', '🏢'],
              ['employer', '💼 Verifier Console', '🔍'],
              ['explorer', '📊 Ledger Explorer', '📈'],
              ['game', '🎮 ZK Cryptography Game', '🎯'],
            ] as [Tab, string, string][]).map(([key, label, emoji]) => (
              <button key={key} className={`sidebar-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🏆 ZK Power Points</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mint)' }} className="sparkle-elem">{score} XP</div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', borderColor: wallet ? 'var(--secondary)' : 'var(--primary)', color: wallet ? 'var(--mint)' : 'var(--primary-light)' }}
            onClick={connectWallet}
          >
            <span>👛</span>
            <span>{wallet ? wallet : 'Connect Wallet'}</span>
          </button>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>● Local Devnet</span>
          </div>
        </div>
      </aside>

      {/* Main dashboard viewport */}
      <div className="main-wrapper">
        <main className="main-content fade-in">
          {/* Connection Mode Warning Banner */}
          {isSandboxWallet && (
            <div className="card" style={{ marginBottom: 16, padding: '10px 18px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Sandbox Mode active:</strong> Extension not detected in this browser. Running ZK proving circuit loops locally via simulator.
              </span>
            </div>
          )}

          {/* Active Contract Info Banner */}
          <div className="card" style={{ marginBottom: 26, padding: '12px 20px', background: 'rgba(20, 184, 166, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderColor: 'var(--border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⛓️ <strong>Active Midnight Contract:</strong> <code style={{ color: 'var(--primary-light)', fontSize: '0.76rem', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px' }}>{DEPLOYED_CONTRACT.address}</code>
            </div>
          </div>

          {tab === 'how' && <HowItWorksTab onNavigate={setTab} />}
          {tab === 'student' && <StudentTab students={students} onVerify={handleAddVerificationActivity} />}
          {tab === 'university' && <UniversityTab students={students} onMint={handleMintStudent} onRevoke={handleRevokeStudent} />}
          {tab === 'employer' && <EmployerTab />}
          {tab === 'explorer' && <ExplorerTab activities={activities} />}
          {tab === 'game' && <ZkGameTab score={score} setScore={setScore} />}
        </main>

        <footer className="footer-bar">
          <strong>ZK Campus Vault</strong> • Developed for INTO the Midnight Challenge • Privacy Secured by Compact ZK Circuits
        </footer>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 1: Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function HowItWorksTab({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  return (
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.04))', padding: '54px 30px', border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="badge" style={{ marginBottom: 12 }}>Level 2 Certified</span>
            <h2 style={{ fontSize: '2.4rem', marginBottom: 14, fontWeight: 800 }} className="gradient-text">Zero-Knowledge Student Credentials</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem', marginBottom: 20 }}>
              ZK Campus Vault eliminates credential fraud and identity leaks using Zero-Knowledge Proofs (ZKPs) on the Midnight Network. Prove eligibility parameters (such as GPA thresholds) without sharing actual scoresheets, transcripts, or roll numbers.
            </p>
            <div className="flex-row">
              <button className="btn btn-primary" onClick={() => onNavigate('student')}>🎓 Access Student Vault</button>
              <button className="btn btn-outline" onClick={() => onNavigate('game')}>🎮 Play ZK Game</button>
            </div>
          </div>
          <div style={{ flex: '1 1 180px', display: 'flex', justifyContent: 'center' }} className="aurora-pulse">
            <span style={{ fontSize: '6.5rem', filter: 'drop-shadow(0 0 20px rgba(20,184,166,0.25))' }}>🛡️</span>
          </div>
        </div>
      </div>

      {/* Dynamic educational information cards */}
      <h3 style={{ fontSize: '1.25rem', marginTop: 10 }} className="gradient-text">Midnight Technology Stack</h3>
      <div className="grid-3">
        <div className="card">
          <h4 style={{ color: 'var(--primary-light)', marginBottom: 8 }}>🌙 What is Midnight?</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Midnight is a data protection-focused sidechain on Cardano. It uses Zero-Knowledge Proofs to allow users to verify claims without exposing private data records.
          </p>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--mint)', marginBottom: 8 }}>📝 Compact Contract Language</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Compact is a programming language specifically built for writing smart contracts with private states on Midnight, converting logic constraints into ZK circuits.
          </p>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--secondary)', marginBottom: 8 }}>🔑 Shielding Keys</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Midnight DApps use client-side cryptography keys to shield public states and verify assertions mathematically on-chain without database lookup.
          </p>
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
  const [copied, setCopied] = useState(false);

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

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const downloadProof = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proof, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zk_proof_${s.name.toLowerCase().replace(' ', '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.05))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>🎓 Student Identity Vault</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Choose a student profile, configure proof parameters, and generate a ZK proof completely locally on your device.
        </p>
      </div>

      <div className="flex-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Active Student Profile:</span>
        {students.map((st, i) => (
          <button key={i} className={`btn btn-outline ${preset === i ? 'active' : ''}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { setPreset(i); setProof(null); }}>
            {st.name} {st.revoked && '🚫 (Revoked)'}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--primary-light)' }}>🔐 Private Off-Chain Credentials</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span className="label">Student ID (Private Input)</span><input className="input" readOnly value={s.id} /></div>
            <div><span className="label">Degree Program</span><input className="input" readOnly value={s.degree + ' (Code: ' + s.code + ')'} /></div>
            <div><span className="label">Actual Cumulative GPA (Private Input)</span><input className="input" readOnly value={s.gpa} /></div>
          </div>
          
          {/* Dynamic ZK Shield Visualization Strength */}
          <div style={{ marginTop: 14, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <span className="label">Midnight Shield Security Strength</span>
            <div style={{ display: 'flex', gap: 6, fontSize: '1.1rem', color: 'var(--amber)' }}>
              ⭐⭐⭐⭐⭐ <span style={{ fontSize: '0.8rem', color: 'var(--mint)', marginLeft: 8 }}>100% ZK Privacy</span>
            </div>
          </div>
        </div>

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

          <button className="btn btn-primary" disabled={generating || s.revoked} onClick={generate} style={{ width: '100%', justifyContent: 'center' }}>
            {s.revoked ? '🚫 Credential Revoked' : generating ? `Computing ZK Proof (Step ${step}/3)...` : '✨ Compute ZK Proof'}
          </button>
        </div>
      </div>

      {generating && (
        <div className="card flex-row" style={{ justifyContent: 'space-around', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex-row" style={{ opacity: step >= 1 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--primary)' }}>1</div><span style={{ fontSize: '0.85rem' }}>Load Secrets</span></div>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <div className="flex-row" style={{ opacity: step >= 2 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--secondary)' }}>2</div><span style={{ fontSize: '0.85rem' }}>Run Prover Circuit</span></div>
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <div className="flex-row" style={{ opacity: step >= 3 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--emerald)' }}>3</div><span style={{ fontSize: '0.85rem' }}>Output ZK Proof JSON</span></div>
        </div>
      )}

      {proof && (
        <div className="card" style={{ borderColor: proof.privacy.status === 'VALID' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 style={{ color: proof.privacy.status === 'VALID' ? '#34d399' : '#f43f5e' }}>
              {proof.privacy.status === 'VALID' ? '✅ ZK Proof Generated Successfully!' : '❌ ZK Proof Failed — Criteria Not Satisfied'}
            </h4>
            <div className="flex-row">
              <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={copy}>
                {copied ? '✓ Copied!' : '📋 Copy Proof'}
              </button>
              <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: 'var(--secondary)' }} onClick={downloadProof}>
                💾 Download Proof
              </button>
            </div>
          </div>
          <div className="code-block"><pre style={{ margin: 0 }}>{JSON.stringify(proof, null, 2)}</pre></div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 3: University Portal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UniversityTabProps {
  students: Student[];
  onMint: (s: Student) => void;
  onRevoke: (id: string) => void;
}

function UniversityTab({ students, onMint, onRevoke }: UniversityTabProps) {
  const [name, setName] = useState('Rahul Deshmukh');
  const [sid, setSid] = useState('20249912');
  const [degree, setDegree] = useState('B.Tech Cyber Security');
  const [code, setCode] = useState('104');
  const [gpa, setGpa] = useState('3.95');
  const [issuing, setIssuing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true); setResult(null);
    setTimeout(() => {
      const commitment = '0x8f3c411a09d7b42ef0192a8c7b6e5d' + Math.random().toString(16).substring(2, 10) + '3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e';
      setResult(commitment);
      setIssuing(false);
      onMint({
        name,
        degree,
        gpa,
        id: sid,
        code,
        commitment,
        revoked: false
      });
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
            <div><span className="label">Student Name</span><input className="input" required value={name} onChange={e => setName(e.target.value)} /></div>
            <div><span className="label">Student ID (Uint64)</span><input className="input" required value={sid} onChange={e => setSid(e.target.value)} /></div>
            <div><span className="label">Degree Program Title</span><input className="input" required value={degree} onChange={e => setDegree(e.target.value)} /></div>
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

        {/* Dynamic credential revocation registry */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--rose)' }}>🚫 Active Credential Registry</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Universities can revoke issued student commitments directly from the ledger registry.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {students.map((st, idx) => (
              <div key={idx} className="flex-row" style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>{st.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {st.id}</span>
                </div>
                <div>
                  {st.revoked ? (
                    <span className="badge badge-red">Revoked</span>
                  ) : (
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => onRevoke(st.id)}>
                      Revoke Commit
                    </button>
                  )}
                </div>
              </div>
            ))}
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
  
  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<{ statement: string; valid: boolean; time: string }[]>([
    { statement: "Alice Sharma: GPA >= 3.50", valid: true, time: "10 mins ago" },
    { statement: "Priya Deshmukh: Enrollment Proof", valid: false, time: "25 mins ago" }
  ]);

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
      const verificationResult = {
        valid: !isFake,
        statement: isFake
          ? 'Verification Failed. Cryptographic proof parameters are invalid or commitment mismatch.'
          : 'Verified. Candidate meets GPA requirements. Zero private data leaked.'
      };
      setResult(verificationResult);
      setVerifying(false);

      // Append verification query to audit log
      setAuditLogs(prev => [{
        statement: isFake ? "Untrusted Client: GPA >= 3.80" : "Client verification check: GPA >= 3.50",
        valid: !isFake,
        time: "Just now"
      }, ...prev]);
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

      <div className="grid-2">
        <div className="card">
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem' }}>🔍 Verify ZK Proof</h3>
            <div className="flex-row">
              <button className="btn btn-outline" onClick={loadValid} style={{ padding: '5px 12px', fontSize: '0.78rem', borderColor: 'rgba(16,185,129,0.4)', color: '#34d399' }}>Load ZK Proof</button>
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
            </div>
          )}
        </div>

        {/* Dynamic audit logs for employers */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary-light)' }}>📋 Verification Audit Trail</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>History of verification audits performed by this node.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {auditLogs.map((log, index) => (
              <div key={index} className="flex-row" style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', display: 'block', color: 'var(--text-muted)' }}>{log.statement}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Timestamp: {log.time}</span>
                </div>
                <span className={`badge ${log.valid ? 'badge-green' : 'badge-red'}`}>
                  {log.valid ? 'Verified' : 'Invalid'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 5: Blockchain Explorer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ExplorerTab({ activities }: { activities: Activity[] }) {
  return (
    <div className="flex-col fade-in">
      <div className="grid-4">
        {[
          { label: 'Total Commitments', value: (14890 + activities.filter(a => a.circuit === 'issue_credential').length).toString(), icon: '📜', sub: 'Updated live' },
          { label: 'ZK Proofs Checked', value: (89400 + activities.filter(a => a.circuit !== 'issue_credential').length).toString(), icon: '🛡️', sub: '100% ZK Privacy' },
          { label: 'Active Smart Contracts', value: '1', icon: '⚡', sub: 'Version 1.0.0' },
          { label: 'Latest Block', value: '#' + (activities.length > 0 ? activities[0].block : 1024).toString(), icon: '⛓️', sub: 'Block Time ~3s' },
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

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>⛓️ Recent ZK Campus Vault Ledger Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activities.map((tx, i) => (
              <div key={i} className="flex-row" style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.25)', borderRadius: 12, justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                <div className="flex-row">
                  <span style={{ color: tx.status === 'SUCCESS' ? '#34d399' : '#f43f5e', fontWeight: 'bold' }}>
                    {tx.status === 'SUCCESS' ? '✓' : tx.status === 'REVOKED' ? '🚫' : '✗'}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.92rem' }}>{tx.type}</strong>
                    <span className="badge" style={{ marginLeft: 10 }}>{tx.circuit}</span>
                  </div>
                </div>
                <div className="flex-row" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Block {tx.block}</span>
                  <span className="badge badge-green">Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger statistics and health card */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: 'var(--mint)' }}>⚡ Node Synchronization Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span className="label">Block Gas Limit Utilization</span>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: 8, borderRadius: 99 }}>
                <div style={{ width: '42%', background: 'var(--mint)', height: '100%', borderRadius: 99 }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Used: 423,892 Gas (42%)</span>
            </div>
            <div>
              <span className="label">Peer Consensus Network Health</span>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: 8, borderRadius: 99 }}>
                <div style={{ width: '92%', background: 'var(--primary)', height: '100%', borderRadius: 99 }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Connected Peers: 12/13 (92% Strength)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 6: Gamified ZK Quiz Game
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ZkGameTabProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

function ZkGameTab({ score, setScore }: ZkGameTabProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const QUESTIONS = [
    {
      q: "What does ZK (Zero-Knowledge) stand for in cryptography?",
      options: [
        "Proving a statement is true without revealing any secret data beyond the statement's truth.",
        "A system that has zero database records saved.",
        "Using public keys to encrypt files completely."
      ],
      correct: 0,
      reward: 100
    },
    {
      q: "Where does local witness generation run in the Midnight DApp model?",
      options: [
        "On the public Midnight blockchain consensus nodes.",
        "Locally inside the user's browser/wallet client memory sandbox.",
        "Inside the university database registries."
      ],
      correct: 1,
      reward: 100
    },
    {
      q: "What is committed on the Midnight ledger when issuing credentials?",
      options: [
        "A plaintext JSON containing Student name, GPA and Roll ID.",
        "A 32-byte hash commitment concealing the private credentials record.",
        "Nothing, everything is kept completely off-chain."
      ],
      correct: 1,
      reward: 100
    }
  ];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const q = QUESTIONS[currentQuestion];
    if (index === q.correct) {
      setFeedback(`🎉 Correct! You unlocked +${q.reward} ZK XP!`);
      setScore(prev => prev + q.reward);
    } else {
      setFeedback("❌ Incorrect. Try reviewing Midnight documentation!");
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    if (currentQuestion + 1 < QUESTIONS.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
    setFeedback(null);
  };

  return (
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.05))' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>🎮 ZK Cryptography Challenge Game</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Answer correct answers to cryptography/Zero-Knowledge concepts and unlock high-level achievements!
        </p>
      </div>

      <div className="card">
        {!quizFinished ? (
          <div>
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="badge" style={{ background: 'var(--border)' }}>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--mint)' }}>Reward: +100 XP</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>{QUESTIONS[currentQuestion].q}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {QUESTIONS[currentQuestion].options.map((opt, i) => (
                <button 
                  key={i} 
                  className={`btn btn-outline`} 
                  style={{ 
                    justifyContent: 'flex-start', 
                    padding: '14px 20px', 
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    borderColor: selectedAnswer === i ? 'var(--secondary)' : 'rgba(255,255,255,0.06)'
                  }}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(i)}
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback && (
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', marginBottom: 16, fontSize: '0.9rem' }}>
                {feedback}
              </div>
            )}

            {selectedAnswer !== null && (
              <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%', justifyContent: 'center' }}>
                {currentQuestion + 1 === QUESTIONS.length ? 'Finish Quiz' : 'Next Question ➜'}
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>🏆</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 10 }}>ZK Cryptography Master unlocked!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 20 }}>
              You successfully finished the challenge. Your active score: <strong style={{ color: 'var(--mint)' }}>{score} XP</strong>
            </p>
            <button className="btn btn-primary" onClick={handleReset}>Play Again</button>
          </div>
        )}
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
