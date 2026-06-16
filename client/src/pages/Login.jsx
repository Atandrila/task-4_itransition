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
    <main className="auth-page">
      <section className="auth-card card shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="brand mb-4">THE APP</div>

          <p className="text-muted small mb-1">Start your journey</p>
          <h3 className="mb-4">Sign In to The App</h3>

          {message && <div className="alert alert-info">{message}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="test@example.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
              />
            </div>

            <button className="btn btn-primary w-100" type="submit">
              Sign In
            </button>
          </form>

          <div className="d-flex justify-content-between mt-4 small">
            <span>
              Do not have an account? <Link to="/register">Sign up</Link>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}