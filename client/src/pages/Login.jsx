import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const queryMessage = searchParams.get("message");

    if (queryMessage) {
      setMessage(queryMessage);
    }
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/auth/login", form);
      navigate("/users");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-left">
          <div className="brand big-brand">THE APP</div>

          <div className="auth-form-wrap">
            <p className="text-muted small mb-1">Start your journey</p>
            <h4 className="mb-4">Sign In to The App</h4>

            {message && <div className="alert alert-info py-2">{message}</div>}

            <form onSubmit={submit}>
              <div className="input-icon mb-3">
                <label className="form-label">E-mail</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="test@example.com"
                />
                <i className="bi bi-envelope-fill"></i>
              </div>

              <div className="input-icon mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
                <i className="bi bi-eye-fill"></i>
              </div>

              <div className="form-check mb-3 small">
                <input className="form-check-input" type="checkbox" id="remember" />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>

              <button className="btn btn-primary w-100" type="submit">
                Sign In
              </button>
            </form>
          </div>

          <div className="auth-bottom small">
            <span>
              Do not have an account? <Link to="/register">Sign up</Link>
            </span>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>

        <div className="auth-right">
          <div className="polygon-bg"></div>
        </div>
      </section>
    </main>
  );
}
