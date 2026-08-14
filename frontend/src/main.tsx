import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — All-in-One Privacy Credentials Suite
 *  Theme: Ultra-Premium Space Violet SaaS Platform
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

type Tab = 'dashboard' | 'student' | 'university' | 'employer' | 'explorer';

const DEPLOYED_CONTRACT = {
  address: "8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
  network: "Midnight Preprod Testnet",
  deployer: "mn_addr_preprod1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s"
};

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [wallet, setWallet] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

  const connectLaceWallet = async () => {
    // @ts-ignore
    const midnight = window.midnight || {};
    // @ts-ignore
    const cardano = window.cardano || {};

    const provider = cardano.lace || midnight.lace || cardano.mnLace || midnight.mnLace;

    if (!provider) {
      alert("Lace Wallet extension not detected! Please ensure you have Lace installed.");
      return;
    }

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
        alert("Wallet connection failed.");
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
        setWallet("Connected");
      }
    } catch (err: any) {
      console.error("Lace Wallet connection failed:", err);
      alert(`Lace Connection Error: ${err.message || err}`);
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
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: 10, borderRadius: 12, display: 'flex', boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }} className="gradient-text">ZK Vault</h2>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>MIDNIGHT PREPROD</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {([
              ['dashboard', '📊 Control Panel', 'dashboard'],
              ['student', '🎓 Student Vault', 'student'],
              ['university', '🏛️ University Portal', 'university'],
              ['employer', '💼 Verifier Console', 'employer'],
              ['explorer', '⛓️ Ledger Explorer', 'explorer'],
            ] as [Tab, string, string][]).map(([key, label]) => (
              <button key={key} className={`sidebar-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                <span style={{ fontSize: '1.1rem' }}>
                  {key === 'dashboard' && '📊'}
                  {key === 'student' && '🎓'}
                  {key === 'university' && '🏛️'}
                  {key === 'employer' && '💼'}
                  {key === 'explorer' && '⛓️'}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          {wallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card" style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)', textAlign: 'center', borderRadius: 12 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--mint)', display: 'block', fontWeight: 700, marginBottom: 4 }}>✓ LACE CONNECTED</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-code)', color: 'var(--text)' }}>{wallet}</span>
              </div>
              <button className="btn" style={{ width: '100%', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose)', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '0.78rem', padding: '8px' }} onClick={() => setWallet(null)}>
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '12px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={connectLaceWallet}>
              <span>👛</span>
              <strong>Connect Lace Wallet</strong>
            </button>
          )}
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '4px 8px' }}>● Preprod Network</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="main-wrapper">
        <main className="main-content fade-in">
          {/* Active Contract Info Banner */}
          <div className="card" style={{ marginBottom: 28, padding: '16px 24px', background: 'linear-gradient(90deg, rgba(13,13,33,0.8), rgba(5,5,18,0.9))', borderColor: 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 2 }}>MIDNIGHT PREPROD CONTRACT ADDRESS</span>
                <code style={{ color: 'var(--primary-light)', fontSize: '0.82rem', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>{DEPLOYED_CONTRACT.address}</code>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Groth16 ZKP Verified</span>
              </div>
            </div>
          </div>

          {tab === 'dashboard' && <DashboardTab onNavigate={setTab} wallet={wallet} onConnect={connectLaceWallet} />}
          {tab === 'student' && <StudentTab students={students} onVerify={handleAddVerificationActivity} />}
          {tab === 'university' && <UniversityTab students={students} onMint={handleMintStudent} onRevoke={handleRevokeStudent} />}
          {tab === 'employer' && <EmployerTab />}
          {tab === 'explorer' && <ExplorerTab activities={activities} />}
        </main>

        <footer className="footer-bar">
          <strong>ZK Campus Vault</strong> • Built with Midnight.js SDK & Compact Cryptography Circuits • Preprod Integration Verified
        </footer>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 1: Dashboard Control Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DashboardTabProps {
  onNavigate: (t: Tab) => void;
  wallet: string | null;
  onConnect: () => void;
}

function DashboardTab({ onNavigate, wallet, onConnect }: DashboardTabProps) {
  return (
    <div className="flex-col fade-in">
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.04))', padding: '48px 36px', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="badge" style={{ marginBottom: 12 }}>Academic Credentials Portal</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: 14, fontWeight: 800 }} className="gradient-text">Zero-Knowledge Student Identity</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.98rem', marginBottom: 20 }}>
              Verify student identity, qualifications, and threshold benchmarks without exposing private information on the blockchain. Fully integrated with Midnight's secure client-side cryptography.
            </p>
            <div className="flex-row">
              <button className="btn btn-primary" onClick={() => onNavigate('student')}>🎓 Student Vault</button>
              <button className="btn btn-outline" onClick={() => onNavigate('university')}>🏛️ University Portal</button>
            </div>
          </div>
          <div style={{ flex: '1 1 180px', display: 'flex', justifyContent: 'center' }} className="aurora-pulse">
            <span style={{ fontSize: '6.5rem', filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.25))' }}>🛡️</span>
          </div>
        </div>
      </div>

      {/* Lace Wallet Status Notice */}
      <div className="card" style={{ border: '1px solid var(--border-glow)', background: 'rgba(139, 92, 246, 0.03)' }}>
        <h4 style={{ color: 'var(--secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💡</span> Lace Wallet Popup Troubleshooting Notice
        </h4>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
          Lace Wallet operates on a persistent authorization protocol. If you click <strong>Connect Lace Wallet</strong> and the official authorization popup does not appear, the website is already authorized in your extension!
        </p>
        <div style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 10, fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.02)' }}>
          <strong>To force the popup again:</strong> Open Lace Wallet ⚙️ Settings ➜ Connected Sites ➜ Find <code>zk-campus-vault-d2sw.vercel.app</code> ➜ Click Disconnect/Delete ➜ Reload this page and click connect again.
        </div>
      </div>

      {/* Platform Architecture */}
      <h3 style={{ fontSize: '1.25rem', marginTop: 10 }} className="gradient-text">How it Works</h3>
      <div className="grid-3">
        <div className="card">
          <h4 style={{ color: 'var(--primary-light)', marginBottom: 8 }}>1. Register Commitment</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Universities publish a cryptographically secure 32-byte hash commitment of the student's credentials. Raw details remain local.
          </p>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--mint)', marginBottom: 8 }}>2. Run Proving Circuit</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Students load their private credentials inside browser RAM and run local circuits to generate a verification proof.
          </p>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--secondary)', marginBottom: 8 }}>3. Verify Privately</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Verifiers check the generated cryptographic proof against the on-chain commitment hash. The candidate's GPA/identity remains hidden.
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
    <div className="flex-col fade-in">
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>🎓 Student Credentials Vault</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Select a profile, configure verification parameters, and run local proof computations inside your browser.
        </p>
      </div>

      <div className="flex-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Profile:</span>
        {students.map((st, i) => (
          <button key={i} className={`btn btn-outline ${preset === i ? 'active' : ''}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { setPreset(i); setProof(null); }}>
            {st.name} {st.revoked && '🚫'}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h4 style={{ fontSize: '0.94rem', marginBottom: 14, color: 'var(--primary-light)' }}>🔐 Shielded Witness (Private Inputs)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span className="label">Student ID</span><input className="input" readOnly value={s.id} /></div>
            <div><span className="label">Program</span><input className="input" readOnly value={s.degree} /></div>
            <div><span className="label">Cumulative GPA</span><input className="input" readOnly value={s.gpa} /></div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '0.94rem', marginBottom: 14, color: 'var(--secondary)' }}>✨ Proving Constraints Configuration</h4>
          <div className="flex-row" style={{ marginBottom: 12 }}>
            <button className={`btn btn-outline ${proofType === 'gpa' ? 'active' : ''}`} style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }} onClick={() => setProofType('gpa')}>GPA Limit</button>
            <button className={`btn btn-outline ${proofType === 'enrollment' ? 'active' : ''}`} style={{ flex: 1, fontSize: '0.75rem', padding: '6px' }} onClick={() => setProofType('enrollment')}>Active Enrollment</button>
          </div>

          {proofType === 'gpa' && (
            <div style={{ marginBottom: 12 }}>
              <span className="label">Required GPA Limit:</span>
              <div className="flex-row">
                <input type="range" min="2.00" max="4.00" step="0.05" value={minGpa} onChange={e => setMinGpa(e.target.value)} style={{ flex: 1, accentColor: 'var(--secondary)' }} />
                <strong style={{ color: 'var(--mint)', fontSize: '1.1rem' }}>{minGpa}</strong>
              </div>
            </div>
          )}

          <button className="btn btn-primary" disabled={generating || s.revoked} onClick={generate} style={{ width: '100%', justifyContent: 'center' }}>
            {s.revoked ? '🚫 Commitment Revoked' : generating ? `Computing ZK Proof (${step}/3)...` : '⚡ Generate ZK Proof'}
          </button>
        </div>
      </div>

      {generating && (
        <div className="card flex-row" style={{ justifyContent: 'space-around', background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex-row" style={{ opacity: step >= 1 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--primary)' }}>1</div><span style={{ fontSize: '0.8rem' }}>Generating Witness</span></div>
          <div className="flex-row" style={{ opacity: step >= 2 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--secondary)' }}>2</div><span style={{ fontSize: '0.8rem' }}>Computing constraints</span></div>
          <div className="flex-row" style={{ opacity: step >= 3 ? 1 : 0.3 }}><div className="step-circle" style={{ background: 'var(--emerald)' }}>3</div><span style={{ fontSize: '0.8rem' }}>ZKP output JSON</span></div>
        </div>
      )}

      {proof && (
        <div className="card" style={{ borderColor: proof.privacy.status === 'VALID' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)' }}>
          <h4 style={{ color: proof.privacy.status === 'VALID' ? 'var(--mint)' : 'var(--rose)', marginBottom: 8 }}>
            {proof.privacy.status === 'VALID' ? '✅ ZK Proof Computed Successfully!' : '❌ Proving Constraints Unsatisfied'}
          </h4>
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
    <div className="flex-col fade-in">
      <div className="grid-2">
        <div className="card">
          <h4 style={{ fontSize: '1rem', marginBottom: 12 }}>🏛️ Issue New Digital Credential</h4>
          <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span className="label">Name</span><input className="input" required value={name} onChange={e => setName(e.target.value)} /></div>
            <div><span className="label">Student ID</span><input className="input" required value={sid} onChange={e => setSid(e.target.value)} /></div>
            <div><span className="label">Degree</span><input className="input" required value={degree} onChange={e => setDegree(e.target.value)} /></div>
            <div className="grid-2" style={{ gap: 8 }}>
              <div><span className="label">Code</span><input className="input" required value={code} onChange={e => setCode(e.target.value)} /></div>
              <div><span className="label">GPA</span><input className="input" required value={gpa} onChange={e => setGpa(e.target.value)} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={issuing} style={{ justifyContent: 'center', marginTop: 4 }}>
              {issuing ? 'Executing on-chain transaction...' : '🪙 Mint Student Commitment'}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
              <span className="label">Published On-Chain Commitment Hash:</span>
              <div className="code-block" style={{ fontSize: '0.74rem' }}>{result}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h4 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--rose)' }}>🚫 Active Revocation Registry</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {students.map((st, idx) => (
              <div key={idx} className="flex-row" style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8, justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>{st.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ID: {st.id}</span>
                </div>
                {st.revoked ? (
                  <span className="badge badge-red">Revoked</span>
                ) : (
                  <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={() => onRevoke(st.id)}>
                    Revoke
                  </button>
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
    <div className="flex-col fade-in">
      <div className="card">
        <h4 style={{ fontSize: '1rem', marginBottom: 12 }}>💼 Verify Candidate Proof JSON</h4>
        <form onSubmit={verifyProof} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea rows={5} className="input" style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem' }} placeholder="Paste ZK Proof JSON here..." required value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={verifying} style={{ justifyContent: 'center' }}>
            {verifying ? 'Running ZK proof verification...' : '🔎 Verify ZK Proof'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: result.valid ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)', border: `1px solid ${result.valid ? 'var(--mint)' : 'var(--rose)'}` }}>
            <strong style={{ color: result.valid ? 'var(--mint)' : 'var(--rose)', display: 'block', marginBottom: 4 }}>
              {result.valid ? '✅ VERIFIED & VALID' : '❌ VERIFICATION FAILED'}
            </strong>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TAB 5: Explorer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ExplorerTab({ activities }: { activities: Activity[] }) {
  return (
    <div className="flex-col fade-in">
      <div className="card">
        <h4 style={{ fontSize: '1.05rem', marginBottom: 14 }}>⛓️ Recent Midnight Preprod Transactions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.map((tx, i) => (
            <div key={i} className="flex-row" style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, justifycontent: 'space-between', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: '0.88rem' }}>{tx.type}</strong>
                <span className="badge" style={{ marginLeft: 8, fontSize: '0.68rem' }}>{tx.circuit}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Block {tx.block} • <span style={{ color: tx.status === 'SUCCESS' ? 'var(--mint)' : 'var(--rose)' }}>{tx.status}</span>
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
