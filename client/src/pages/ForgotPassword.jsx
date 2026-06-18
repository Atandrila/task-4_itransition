import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Could not send reset link.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-left">
          <div className="brand big-brand">THE APP</div>

          <div className="auth-form-wrap">
            <p className="text-muted small mb-1">Password recovery</p>
            <h4 className="mb-4">Forgot Password?</h4>

            {message && (
              <div className={`alert ${isError ? "alert-danger" : "alert-success"} py-2`}>
                {message}
              </div>
            )}

            <form onSubmit={submit}>
              <div className="input-icon mb-3">
                <label className="form-label">E-mail</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <i className="bi bi-envelope-fill"></i>
              </div>

              <button className="btn btn-primary w-100" type="submit">
                Send Reset Link
              </button>
            </form>
          </div>

          <div className="auth-bottom small">
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>

        <div className="auth-right">
          <div className="polygon-bg"></div>
        </div>
      </section>
    </main>
  );
}