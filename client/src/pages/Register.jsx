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
    <main className="auth-page">
      <section className="auth-card card shadow-sm">
        <div className="card-body p-4 p-md-5">
          <div className="brand mb-4">THE APP</div>

          <p className="text-muted small mb-1">Create your account</p>
          <h3 className="mb-4">Register</h3>

          {message && (
            <div className={`alert ${isError ? "alert-danger" : "alert-success"}`}>
              {message}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Any non-empty password"
              />
            </div>

            <button className="btn btn-primary w-100" type="submit">
              Register
            </button>
          </form>

          <div className="mt-4 small">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}