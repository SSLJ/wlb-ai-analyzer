import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const allowedDomains = ["rajagiri.edu.in", "rajagiri.edu.tech"];

const isAllowedEmail = (email) => {
  const domain = email.split("@")[1];
  return allowedDomains.includes(domain);
};

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleError = (msg) => { setError(msg); setLoading(false); };

  const signIn = async () => {
    setError("");
    if (!isAllowedEmail(email)) return handleError("Please use your organisation email (@rajagiri.edu.in).");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      handleError(err.message.replace("Firebase: ", "").replace(/ \(auth.*\)\.?/, ""));
    }
  };

  const signUp = async () => {
    setError("");
    if (!isAllowedEmail(email)) return handleError("Please use your organisation email (@rajagiri.edu.in).");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      handleError(err.message.replace("Firebase: ", "").replace(/ \(auth.*\)\.?/, ""));
    }
  };

  const googleLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const email = result.user.email;
    const domain = email.split("@")[1];

    if (!allowedDomains.includes(domain)) {
      await auth.signOut();
      return handleError(
        "Please sign in using your organisation email (@rajagiri.edu.in or @rajagiri.edu.tech)"
      );
    }

  } catch (err) {
    handleError(
      err.message.replace("Firebase: ", "").replace(/ \(auth.*\)\.?/, "")
    );
  }
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .login-page {
          min-height: 100vh;
          background: #F2F4F8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 24px 16px;
        }

        .login-wrap {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Brand above card */
        .login-brand {
          text-align: center;
          margin-bottom: 28px;
        }
        .login-brand-name {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
        }
        .login-brand-name span { color: #4F46E5; }
        .login-brand-sub {
          font-size: 13px;
          color: #9CA3AF;
          margin-top: 4px;
          font-weight: 500;
        }

        /* Card */
        .login-card {
          background: #fff;
          border-radius: 22px;
          padding: 36px 36px 32px;
          box-shadow: 0 2px 6px rgba(0,0,0,.04), 0 10px 32px rgba(0,0,0,.08);
          border: 1px solid #EDEBE6;
        }

        .login-card-title {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
          letter-spacing: -0.2px;
        }
        .login-card-sub {
          font-size: 13px;
          color: #9CA3AF;
          margin-bottom: 28px;
          font-weight: 500;
        }

        /* Input */
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 14px;
        }
        .login-label {
          font-size: 12px;
          font-weight: 700;
          color: #6B7280;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .login-input {
          padding: 11px 14px;
          border-radius: 11px;
          border: 1.5px solid #E5E7EB;
          background: #FAFAFA;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          width: 100%;
        }
        .login-input:focus {
          border-color: #818CF8;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,.08);
        }
        .login-input::placeholder { color: #C4CAD4; }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0 16px;
        }
        .login-divider-line { flex: 1; height: 1px; background: #E5E7EB; }
        .login-divider-text { font-size: 12px; color: #9CA3AF; font-weight: 600; white-space: nowrap; }

        /* Buttons */
        .btn-primary {
          width: 100%;
          padding: 12px;
          border-radius: 11px;
          border: none;
          background: #4F46E5;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s;
          letter-spacing: 0.2px;
          margin-bottom: 10px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #4338CA;
          box-shadow: 0 4px 14px rgba(79,70,229,.3);
          transform: translateY(-1px);
        }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .btn-outline {
          width: 100%;
          padding: 11px;
          border-radius: 11px;
          border: 1.5px solid #E5E7EB;
          background: #fff;
          color: #374151;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s;
          margin-bottom: 10px;
        }
        .btn-outline:hover:not(:disabled) {
          border-color: #A5B4FC;
          color: #4338CA;
          background: #EEF2FF;
          transform: translateY(-1px);
        }
        .btn-outline:disabled { opacity: .5; cursor: not-allowed; }

        .btn-google {
          width: 100%;
          padding: 11px;
          border-radius: 11px;
          border: 1.5px solid #E5E7EB;
          background: #fff;
          color: #374151;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-google:hover:not(:disabled) {
          border-color: #D1D5DB;
          background: #F9FAFB;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
          transform: translateY(-1px);
        }
        .btn-google:disabled { opacity: .5; cursor: not-allowed; }

        .google-icon {
          width: 18px; height: 18px; flex-shrink: 0;
        }

        /* Error */
        .login-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 9px;
          padding: 10px 14px;
          font-size: 13px;
          color: #B91C1C;
          font-weight: 500;
          margin-bottom: 14px;
          text-align: center;
        }

        /* Footer note */
        .login-footer {
          text-align: center;
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 20px;
          font-weight: 500;
        }
        .login-footer span { color: #4F46E5; font-weight: 600; }
      `}</style>

      <div className="login-page">
        <div className="login-wrap">

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-name">
              Work Life <span>Balance</span> AI
            </div>
            <div className="login-brand-sub"></div>
          </div>

          {/* Card */}
          <div className="login-card">
            <div className="login-card-title">Login</div>
            <div className="login-card-sub"></div>

            {error && <div className="login-error">{error}</div>}

            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="you@rajagiri.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && signIn()}
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="*******"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && signIn()}
              />
            </div>

            {/* Primary actions */}
            <div style={{ marginTop: 22 }}>
              <button className="btn-primary" onClick={signIn} disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <button className="btn-outline" onClick={signUp} disabled={loading}>
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">or continue with</span>
              <div className="login-divider-line" />
            </div>

            {/* Google */}
            <button className="btn-google" onClick={googleLogin} disabled={loading}>
              {/* Google SVG icon */}
              <svg className="google-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="login-footer">
            Restricted to <span>@rajagiri.edu.in</span> accounts only
          </div>

        </div>
      </div>
    </>
  );
}