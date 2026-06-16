import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import UserTable from "../components/UserTable";

export default function Users() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  async function loadCurrentUser() {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data.user);
    } catch {
      navigate("/login");
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      navigate("/login");
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container-fluid px-4">
          <span className="navbar-brand fw-bold">User Management</span>

          <div className="d-flex align-items-center gap-3">
            {currentUser && (
              <span className="text-muted small d-none d-md-inline">
                {currentUser.name} · {currentUser.email}
              </span>
            )}

            <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">Users</h4>
            <p className="text-muted mb-0">
              Select users and manage their access from the toolbar.
            </p>
          </div>
        </div>

        <UserTable />
      </main>
    </>
  );
}