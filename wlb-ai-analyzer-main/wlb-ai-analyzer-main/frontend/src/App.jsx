import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import ModernQuestionnaire from "./ModernQuestionnaire";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState("questions");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#9CA3AF",
        background:"#F2F4F8", fontSize:15,
      }}>
        Loading…
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div style={{ minHeight:"100vh", background:"#F2F4F8" }}>

      {/* ── Header ── */}
      <header style={{
        background:"#fff",
        borderBottom:"1px solid #EDEBE6",
        height:64,
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        padding:"0 28px",
        boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
        position:"sticky",
        top:0,
        zIndex:100,
      }}>

        {/* Brand */}
        <span style={{
          fontFamily:"'Lora',serif",
          fontWeight:700,
          fontSize:17,
          color:"#111827",
          letterSpacing:"-0.3px",
          userSelect:"none",
        }}>
          Work Life{" "}
          <span style={{ color:"#4F46E5" }}>Balance</span>{" "}
          AI
        </span>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            fontSize:14, fontWeight:600, color:"#374151",
          }}>
            {user.displayName || user.email}
          </span>

          <button
            onClick={() => signOut(auth)}
            style={{
              padding:"6px 14px", borderRadius:8,
              border:"1.5px solid #E5E7EB", background:"#fff",
              cursor:"pointer",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:13, fontWeight:600, color:"#6B7280",
              transition:"all .15s",
            }}
            onMouseOver={e => Object.assign(e.currentTarget.style, { borderColor:"#FDA4AF", color:"#BE123C", background:"#FFF1F2" })}
            onMouseOut={e  => Object.assign(e.currentTarget.style, { borderColor:"#E5E7EB", color:"#6B7280",  background:"#fff" })}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Pages ── */}
      {page === "questions" && (
        <ModernQuestionnaire onComplete={() => setPage("dashboard")} />
      )}
      {page === "dashboard" && (
        <Dashboard />
      )}

    </div>
  );
}

export default App;