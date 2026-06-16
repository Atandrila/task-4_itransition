import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

function formatDate(value) {
  // important: keep table dates readable for business UI.
  // note: empty dates should not break the table.
  // nota bene: backend still controls the actual sorting.
  if (!value) return "Never";

  return new Date(value).toLocaleString();
}

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [filter, setFilter] = useState("");

  async function loadUsers() {
    const res = await api.get("/users");
    setUsers(res.data.users);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const text = filter.toLowerCase().trim();

    if (!text) return users;

    return users.filter(user =>
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text) ||
      user.status.toLowerCase().includes(text)
    );
  }, [users, filter]);

  const allSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every(user => selected.has(user.id));

  function toggleAll() {
    if (allSelected) {
      const next = new Set(selected);
      filteredUsers.forEach(user => next.delete(user.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filteredUsers.forEach(user => next.add(user.id));
      setSelected(next);
    }
  }

  function toggleOne(id) {
    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelected(next);
  }

  async function runAction(action) {
    setMessage("");
    setIsError(false);

    try {
      const ids = [...selected];

      if (ids.length === 0) {
        setIsError(true);
        setMessage("Select at least one user.");
        return;
      }

      if (action === "block") {
        await api.patch("/users/block", { ids });
      }

      if (action === "unblock") {
        await api.patch("/users/unblock", { ids });
      }

      if (action === "delete") {
        await api.delete("/users", { data: { ids } });
      }

      setSelected(new Set());
      setMessage("Operation completed successfully.");
      await loadUsers();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Operation failed.");
    }
  }

  async function deleteUnverified() {
    setMessage("");
    setIsError(false);

    try {
      await api.delete("/users/unverified");
      setSelected(new Set());
      setMessage("All unverified users deleted successfully.");
      await loadUsers();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Operation failed.");
    }
  }

  function statusClass(status) {
    if (status === "active") return "text-bg-success";
    if (status === "blocked") return "text-bg-danger";
    return "text-bg-secondary";
  }

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
        {message && (
          <div className={`alert ${isError ? "alert-danger" : "alert-success"} py-2`}>
            {message}
          </div>
        )}

        <div className="toolbar d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={selected.size === 0}
              title="Block selected users"
              onClick={() => runAction("block")}
            >
              <i className="bi bi-lock-fill me-1"></i>
              Block
            </button>

            <button
              className="btn btn-outline-primary btn-sm"
              disabled={selected.size === 0}
              title="Unblock selected users"
              onClick={() => runAction("unblock")}
            >
              <i className="bi bi-unlock-fill"></i>
            </button>

            <button
              className="btn btn-outline-danger btn-sm"
              disabled={selected.size === 0}
              title="Delete selected users"
              onClick={() => runAction("delete")}
            >
              <i className="bi bi-trash-fill"></i>
            </button>

            <button
              className="btn btn-outline-danger btn-sm"
              title="Delete all unverified users"
              onClick={deleteUnverified}
            >
              <i className="bi bi-person-x-fill"></i>
            </button>
          </div>

          <input
            className="form-control form-control-sm filter-input"
            placeholder="Filter"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all users"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Last activity</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={user.status === "blocked" ? "blocked-row" : ""}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      aria-label="Select user"
                      checked={selected.has(user.id)}
                      onChange={() => toggleOne(user.id)}
                    />
                  </td>

                  <td>
                    <div className="fw-semibold">{user.name}</div>
                    <div className="text-muted small">Registered user</div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span className={`badge ${statusClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>

                  <td>{formatDate(user.last_login_at)}</td>
                  <td>{formatDate(user.last_activity_at)}</td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}