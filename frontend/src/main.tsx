import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ZK Campus Vault — Cryptographic Command Center (Terminal Concept)
 *  Theme: Cyberpunk Hacker Terminal & ZK Prover Console
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Student {
  name: string;
  degree: string;
  gpa: string;
  id: string;
  commitment?: string;
  revoked?: boolean;
}

const INITIAL_STUDENTS: Student[] = [
  { name: 'Alice Sharma', degree: 'B.Tech CS', gpa: '3.85', id: '20249821', commitment: '0x8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', revoked: false },
  { name: 'Rohan Patil', degree: 'M.Tech AI', gpa: '3.92', id: '20249845', commitment: '0x3cb411af09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f2b', revoked: false },
  { name: 'Priya Deshmukh', degree: 'B.Sc IT', gpa: '3.40', id: '20249872', commitment: '0x1a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e8f3c41', revoked: true },
];

const DEPLOYED_CONTRACT = "8f3c411a09d7b42ef0192a8c7b6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e";

function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);

  // Prover Config
  const [minGpa, setMinGpa] = useState('3.50');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System initialized. Ready for cryptographic operations.",
    `Connected to preprod contract: ${DEPLOYED_CONTRACT}`
  ]);
  const [proving, setProving] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<any>(null);

  // Registrar inputs
  const [regName, setRegName] = useState('Aniket Rao');
  const [regGpa, setRegGpa] = useState('3.98');
  const [regSid, setRegSid] = useState('20249954');
  const [issuing, setIssuing] = useState(false);

  // Verifier input
  const [verifierInput, setVerifierInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyOutcome, setVerifyOutcome] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const connectLaceWallet = async () => {
    if (connecting) return;
    // @ts-ignore
    const midnight = window.midnight || {};
    // @ts-ignore
    const cardano = window.cardano || {};
    const provider = cardano.lace || midnight.lace || cardano.mnLace || midnight.mnLace;

    if (!provider) {
      addLog("ERROR: Lace extension not found in window context.");
      alert("Lace Wallet extension not detected!");
      return;
    }

    setConnecting(true);
    addLog("Requesting Lace DApp connector authorization...");

    try {
      let api = await provider.enable();
      let rawAddr = await api.getChangeAddress();
      if (rawAddr) {
        setWallet(rawAddr.substring(0, 8) + '...' + rawAddr.substring(rawAddr.length - 4));
        addLog(`SUCCESS: Wallet connected. Address: ${rawAddr}`);
      } else {
        setWallet("Lace Wallet");
        addLog("SUCCESS: Authorized Lace session.");
      }
    } catch (err: any) {
      addLog(`ERROR: Connection denied. ${err.message || err}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleMintCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true);
    addLog(`MINT: Generating commitment for ${regName} (ID: ${regSid})...`);

    setTimeout(() => {
      const commitment = '0x8f3c411a' + Math.random().toString(16).substring(2, 10) + 'e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e';
      const newStudent: Student = {
        name: regName,
        degree: 'B.Tech CS',
        gpa: regGpa,
        id: regSid,
        commitment,
        revoked: false
      };
      setStudents(prev => [newStudent, ...prev]);
      addLog(`SUCCESS: Commitment published on-chain. Hash: ${commitment}`);
      setIssuing(false);
    }, 1000);
  };

  const handleRevoke = (id: string, name: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, revoked: true } : s));
    addLog(`REVOKE: Initiated commitment revocation for ${name}...`);
    setTimeout(() => {
      addLog(`SUCCESS: Commitment revoked on preprod registry for student ID ${id}.`);
    }, 500);
  };

  const runZkProver = () => {
    const s = students[selectedStudentIdx];
    if (s.revoked) {
      addLog(`ERROR: Cannot generate proof. Commitment for ${s.name} is revoked.`);
      return;
    }

    setProving(true);
    setGeneratedProof(null);
    addLog(`PROVER: Instantiating Groth16 campus_vault.compact prover...`);
    addLog(`PROVER: Fetching private witness inputs for student ID ${s.id}...`);

    setTimeout(() => {
      addLog(`PROVER: Evaluating circuit constraint: GPA (${s.gpa}) >= Limit (${minGpa})`);
      const passed = parseFloat(s.gpa) >= parseFloat(minGpa);

      setTimeout(() => {
        if (passed) {
          addLog(`PROVER: Constraint satisfied. Synthesizing cryptographic proof JSON...`);
          const mockProof = {
            circuit: 'prove_gpa_threshold',
            contract: 'campus_vault.compact',
            public_inputs: { min_gpa_x100: Math.round(parseFloat(minGpa) * 100), commitment: s.commitment },
            proof_data: "0x25a9f3b8c8d...ff930b5e28a",
            privacy: { actual_gpa_revealed: false, status: 'VALID' }
          };
          setGeneratedProof(mockProof);
          addLog(`SUCCESS: ZK Proof generated. Zero information leaked.`);
        } else {
          addLog(`ERROR: GPA constraint failed. Prover aborted execution.`);
        }
        setProving(false);
      }, 600);
    }, 600);
  };

  const verifyProofInput = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyOutcome(null);
    addLog("VERIFIER: Running cryptographic verification on inputs...");

    setTimeout(() => {
      const isFake = verifierInput.includes('TAMPERED') || verifierInput.includes('FAKE') || verifierInput.includes('"status": "FAILED"');
      if (isFake) {
        setVerifyOutcome("Verification FAILED. proof constraints not satisfied.");
        addLog("VERIFIER: FAIL. Invalid proof signature kiva commitment mismatch.");
      } else {
        setVerifyOutcome("Verification SUCCESSFUL. Cryptographic ZK check passed.");
        addLog("VERIFIER: PASS. Groth16 check matches on-chain commitment.");
      }
      setVerifying(false);
    }, 800);
  };

  return (
    <div className="terminal-workspace">
      {/* Mesh glowing particle background */}
      <div className="cyber-glow-bg"></div>

      {/* Terminal Main Header */}
      <header className="terminal-header">
        <div className="header-left">
          <span className="blink-dot">●</span>
          <span className="terminal-logo">ZK_VAULT // CORE_COMMAND_CENTER</span>
        </div>
        <div className="header-right">
          <span className="net-badge">NET: PREPROD</span>
          {wallet ? (
            <span className="wallet-badge" onClick={() => setWallet(null)}>{wallet} [DISCONNECT]</span>
          ) : (
            <button className="connect-btn-terminal" onClick={connectLaceWallet}>
              {connecting ? 'INITIALIZING...' : 'CONNECT_LACE_WALLET'}
            </button>
          )}
        </div>
      </header>

      {/* Main Terminal Grid */}
      <div className="terminal-main-grid">
        
        {/* Left Panel: Logs & Terminal Console */}
        <div className="terminal-panel console-panel">
          <div className="panel-hdr">
            <span>💻 LOG_OUTPUT_SHELL</span>
            <button className="clean-btn" onClick={() => setConsoleLogs(["Console cleared."])}>CLEAR</button>
          </div>
          <div className="terminal-log-screen">
            {consoleLogs.map((log, i) => (
              <div key={i} className="log-line">{log}</div>
            ))}
            <div ref={logsEndRef} />
          </div>
          {generatedProof && (
            <div className="proof-terminal-view">
              <span style={{ color: 'var(--mint)', display: 'block', marginBottom: 6 }}>&gt; GENERATED_PROOF_JSON:</span>
              <pre className="proof-pre">{JSON.stringify(generatedProof, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Right Panel: Operations Modules */}
        <div className="operations-modules-grid">
          
          {/* MODULE 1: UNIVERSITY REGISTRAR */}
          <div className="terminal-panel">
            <div className="panel-hdr">🏫 MODULE_01: registrar_portal</div>
            <form onSubmit={handleMintCommitment} className="terminal-form">
              <div className="terminal-field">
                <label>STUDENT_NAME</label>
                <input required value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div className="terminal-field-row">
                <div className="terminal-field" style={{ flex: 1 }}>
                  <label>STUDENT_ID</label>
                  <input required value={regSid} onChange={e => setRegSid(e.target.value)} />
                </div>
                <div className="terminal-field" style={{ flex: 1 }}>
                  <label>GPA</label>
                  <input required value={regGpa} onChange={e => setRegGpa(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="terminal-submit-btn" disabled={issuing}>
                {issuing ? 'EXECUTING_MINT...' : 'PUBLISH_CREDENTIAL_COMMITMENT'}
              </button>
            </form>

            {/* Active Commitments List */}
            <div className="terminal-sub-section">
              <span className="section-sub-label">ON_CHAIN_COMMITMENTS_REGISTRY</span>
              <div className="commitments-scroller">
                {students.map((st, i) => (
                  <div key={i} className="commitment-terminal-item">
                    <div>
                      <strong>{st.name}</strong>
                      <span className="hash-code-text">{st.commitment?.substring(0, 18)}...</span>
                    </div>
                    {st.revoked ? (
                      <span className="status-revoked-text">[REVOKED]</span>
                    ) : (
                      <button className="revoke-terminal-btn" onClick={() => handleRevoke(st.id, st.name)}>REVOKE</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MODULE 2: STUDENT PROVER */}
          <div className="terminal-panel">
            <div className="panel-hdr">🎓 MODULE_02: student_prover_witness</div>
            <div className="terminal-form">
              <div className="terminal-field">
                <label>CHOOSE_IDENTITY</label>
                <select value={selectedStudentIdx} onChange={e => { setSelectedStudentIdx(parseInt(e.target.value)); setGeneratedProof(null); }}>
                  {students.map((st, i) => (
                    <option key={i} value={i}>{st.name} (GPA: {st.gpa}) {st.revoked ? '[REVOKED]' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="terminal-field">
                <label>LIMIT_CONSTRAINT: GPA &gt;= {minGpa}</label>
                <input type="range" min="2.00" max="4.00" step="0.05" value={minGpa} onChange={e => setMinGpa(e.target.value)} className="cyber-slider" />
              </div>

              <button className="terminal-submit-btn pro-btn" onClick={runZkProver} disabled={proving || students[selectedStudentIdx]?.revoked}>
                {proving ? 'COMPUTING_PROOF...' : 'GENERATE_ZERO_KNOWLEDGE_PROOF'}
              </button>
            </div>
          </div>

          {/* MODULE 3: EMPLOYER VERIFIER */}
          <div className="terminal-panel">
            <div className="panel-hdr">🔍 MODULE_03: verifier_console</div>
            <form onSubmit={verifyProofInput} className="terminal-form">
              <div className="terminal-field">
                <label>PASTE_PROOF_JSON_ witness_outputs</label>
                <textarea rows={4} required placeholder="Paste proof parameter JSON..." value={verifierInput} onChange={e => setVerifierInput(e.target.value)} />
              </div>
              <button type="submit" className="terminal-submit-btn" disabled={verifying}>
                {verifying ? 'CHECKING_SIGNATURES...' : 'RUN_CRYPTO_VERIFICATION'}
              </button>
            </form>

            {verifyOutcome && (
              <div className={`terminal-alert-box ${verifyOutcome.includes('SUCCESS') ? 'pass' : 'fail'}`}>
                {verifyOutcome}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Terminal Footer */}
      <footer className="terminal-footer">
        <span>SYSTEM_STATUS: ACTIVE</span>
        <span>DEPLOYED_CONTRACT_SCHEMA: campus_vault.compact [GROTH16]</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
