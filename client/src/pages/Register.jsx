import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message);
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Registration failed.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-left">
          <div className="brand big-brand">THE APP</div>

          <div className="auth-form-wrap">
            <p className="text-muted small mb-1">Create your account</p>
            <h4 className="mb-4">Register to The App</h4>

            {message && (
              <div className={`alert ${isError ? "alert-danger" : "alert-success"} py-2`}>
                {message}
              </div>
            )}

            <form onSubmit={submit}>
              <div className="input-icon mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
                <i className="bi bi-person-fill"></i>
              </div>

              <div className="input-icon mb-3">
                <label className="form-label">E-mail</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
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
                  placeholder="Any non-empty password"
                />
                <i className="bi bi-eye-fill"></i>
              </div>

              <button className="btn btn-primary w-100" type="submit">
                Register
              </button>
            </form>
          </div>

          <div className="auth-bottom small">
            <span>
              Already have an account? <Link to="/login">Sign in</Link>
            </span>
          </div>
        </div>

        <div className="auth-right">
          <div className="polygon-bg"></div>
        </div>
      </section>
    </main>
  );
}
