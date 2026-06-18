import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        password
      });

      setMessage(res.data.message);
      setPassword("");
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Password reset failed.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-left">
          <div className="brand big-brand">THE APP</div>

          <div className="auth-form-wrap">
            <p className="text-muted small mb-1">Create new password</p>
            <h4 className="mb-4">Reset Password</h4>

            {!token && (
              <div className="alert alert-danger py-2">
                Invalid reset link.
              </div>
            )}

            {message && (
              <div className={`alert ${isError ? "alert-danger" : "alert-success"} py-2`}>
                {message}
              </div>
            )}

            <form onSubmit={submit}>
              <div className="input-icon mb-3">
                <label className="form-label">New password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="New password"
                  disabled={!token}
                />
                <i className="bi bi-eye-fill"></i>
              </div>

              <button className="btn btn-primary w-100" type="submit" disabled={!token}>
                Reset Password
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