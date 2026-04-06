import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Reducer/AuthSlice";

const API = "http://localhost:5000/api/admin";

const getHeaders = () => {
  const stored = sessionStorage.getItem("energy_token");
  const token  = stored ? JSON.parse(stored)?.token : null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

const AVATAR_COLORS = [
  "#1D9E75","#378ADD","#D4537E",
  "#BA7517","#534AB7","#D85A30",
];

/* ── SVG Icons ─────────────────────────────────────── */
const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconStar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconBell = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconSettings = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const IconPerson = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBolt = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

export default function AdminPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activePage, setActivePage] = useState("overview");
  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${API}/stats`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch {
      showToast("Failed to load stats", "error");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === "subscribed" ? `${API}/users/subscribed` : `${API}/users`;
      const res  = await fetch(endpoint, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    if (activePage === "users" || activePage === "subscribers") fetchUsers();
  }, [activePage, filter]);

  const handleToggleSub = async (userId) => {
    try {
      const res  = await fetch(`${API}/users/${userId}/toggle-subscription`, {
        method: "PATCH", headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isSubscribed: data.isSubscribed } : u));
        fetchStats();
      }
    } catch { showToast("Failed to update subscription", "error"); }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res  = await fetch(`${API}/users/${userId}/toggle-active`, {
        method: "PATCH", headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: data.isActive } : u));
      }
    } catch { showToast("Failed to update status", "error"); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      const res  = await fetch(`${API}/users/${userId}`, {
        method: "DELETE", headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("User deleted successfully");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        fetchStats();
      }
    } catch { showToast("Failed to delete user", "error"); }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const filteredUsers = users.filter((u) => {
    const matchFilter =
      filter === "all"        ? true :
      filter === "subscribed" ? u.isSubscribed :
      filter === "free"       ? !u.isSubscribed :
      filter === "active"     ? u.isActive :
      filter === "inactive"   ? !u.isActive : true;
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const subRate = stats
    ? ((stats.subscribedUsers / (stats.totalUsers || 1)) * 100).toFixed(1)
    : "0.0";

  const navItems = [
    { id: "overview",    label: "Overview",    icon: <IconGrid /> },
    { id: "users",       label: "All Users",   icon: <IconUsers /> },
    { id: "subscribers", label: "Subscribers", icon: <IconStar /> },
  ];

  return (
    <div className="ap-wrap">

      {/* ── Toast ── */}
      {toast && (
        <div className={`ap-toast ${toast.type === "error" ? "ap-toast--error" : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="ap-sidebar">
        <div className="ap-logo">
          <div className="ap-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="ap-logo-title">MyEnergy</div>
            <div className="ap-logo-sub">Admin Console</div>
          </div>
        </div>

        <nav className="ap-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`ap-nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => {
                setActivePage(item.id);
                setFilter(item.id === "subscribers" ? "subscribed" : "all");
                setSearch("");
              }}
            >
              <span className="ap-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="ap-logout" onClick={handleLogout}>
          <IconLogout />
          Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="ap-main">

        {/* Topbar */}
        <div className="ap-topbar">
          <div className="ap-search-wrap">
            <svg className="ap-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="ap-search" placeholder="Search data..." />
          </div>
          <div className="ap-topbar-right">
            <button className="ap-icon-btn"><IconBell /></button>
            <button className="ap-icon-btn"><IconSettings /></button>
            <div className="ap-avatar-top">A</div>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {activePage === "overview" && (
          <div className="ap-page">
            <h1 className="ap-page-title">Overview</h1>

            {stats ? (
              <>
                <div className="ap-metrics">
                  <div className="ap-metric-card ap-metric-card--hero">
                    <div className="ap-metric-label">Total Users</div>
                    <div className="ap-metric-val">{stats.totalUsers}</div>
                    <div className="ap-metric-growth">+12%</div>
                    <div className="ap-metric-bar">
                      <div className="ap-metric-bar-fill" style={{ width: "65%" }} />
                    </div>
                  </div>

                  <div className="ap-metric-card">
                    <div className="ap-metric-row">
                      <div>
                        <div className="ap-metric-label">Subscribed</div>
                        <div className="ap-metric-val">{stats.subscribedUsers}</div>
                        <div className="ap-metric-sub">No active premium plans</div>
                      </div>
                      <div className="ap-metric-ico"><IconCheck /></div>
                    </div>
                  </div>

                  <div className="ap-metric-card">
                    <div className="ap-metric-row">
                      <div>
                        <div className="ap-metric-label">Free Users</div>
                        <div className="ap-metric-val">{stats.freeUsers}</div>
                        <div className="ap-metric-sub">Standard access level</div>
                      </div>
                      <div className="ap-metric-ico"><IconPerson /></div>
                    </div>
                  </div>

                  <div className="ap-metric-card">
                    <div className="ap-metric-row">
                      <div>
                        <div className="ap-metric-label">Active Users</div>
                        <div className="ap-metric-val">{stats.activeUsers}</div>
                        <div className="ap-metric-sub">Currently online</div>
                      </div>
                      <div className="ap-metric-ico"><IconBolt /></div>
                    </div>
                  </div>

                  <div className="ap-metric-card">
                    <div className="ap-metric-row">
                      <div>
                        <div className="ap-metric-label">Sub Rate</div>
                        <div className="ap-metric-val">{subRate}%</div>
                        <div className="ap-metric-sub">Conversion baseline</div>
                      </div>
                      <div className="ap-metric-ico"><IconBarChart /></div>
                    </div>
                  </div>
                </div>

                <div className="ap-bottom-row">
                  <div className="ap-section-card">
                    <div className="ap-section-title">
                      <span className="ap-section-accent" />
                      Quick actions
                    </div>
                    <div className="ap-quick-actions">
                      <button className="ap-action-btn" onClick={() => setActivePage("users")}>
                        <div className="ap-action-ico">👥</div>
                        <div>
                          <div className="ap-action-title">View all users</div>
                          <div className="ap-action-sub">Manage member database</div>
                        </div>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                      <button className="ap-action-btn" onClick={() => { setActivePage("subscribers"); setFilter("subscribed"); }}>
                        <div className="ap-action-ico">⭐</div>
                        <div>
                          <div className="ap-action-title">View subscribers</div>
                          <div className="ap-action-sub">Analyze paid memberships</div>
                        </div>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="ap-insights-card">
                    <span className="ap-insights-tag">Insights</span>
                    <div className="ap-insights-title">Energy usage<br />is stabilizing.</div>
                    <p className="ap-insights-body">
                      System performance is at an all-time high with 99.9% uptime recorded this week across all user nodes.
                    </p>
                    <div className="ap-insights-actions">
                      <button className="ap-insights-btn-primary">Generate Report</button>
                      <button className="ap-insights-btn-ghost">Dismiss</button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="ap-loading">Loading stats…</div>
            )}
          </div>
        )}

        {/* ── USERS / SUBSCRIBERS ── */}
        {(activePage === "users" || activePage === "subscribers") && (
          <div className="ap-page">
            <div className="ap-page-header">
              <div>
                <h1 className="ap-page-title">
                  {activePage === "subscribers" ? "Subscribers" : "All Users"}
                </h1>
                <p className="ap-page-sub">
                  {filteredUsers.length} users
                  {activePage === "subscribers" && (
                    <span className="ap-dir-badge">Active Directory</span>
                  )}
                </p>
              </div>
            </div>

            <div className="ap-section-card">
              <div className="ap-section-header">
                <div className="ap-filters">
                  {(activePage === "users"
                    ? ["all", "subscribed", "free", "active", "inactive"]
                    : ["subscribed"]
                  ).map((f) => (
                    <button
                      key={f}
                      className={`ap-filter-btn ${filter === f ? "active" : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {f === "subscribed" && activePage === "subscribers" && (
                        <span className="ap-filter-dot" />
                      )}
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="ap-search-wrap ap-search-wrap--sm">
                  <svg className="ap-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    className="ap-search"
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="ap-loading">Loading users…</div>
              ) : filteredUsers.length === 0 ? (
                <div className="ap-empty">
                  <div className="ap-empty-icon">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  </div>
                  <div className="ap-empty-title">No users found</div>
                  <div className="ap-empty-sub">
                    Your subscriber list is currently empty. Adjust your search parameters or invite new users to get started.
                  </div>
                  {activePage === "subscribers" && (
                    <button className="ap-invite-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      Invite Subscriber
                    </button>
                  )}
                </div>
              ) : (
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={u._id}>
                          <td>
                            <div className="ap-user-cell">
                              <div
                                className="ap-avatar"
                                style={{
                                  background: AVATAR_COLORS[i % AVATAR_COLORS.length] + "22",
                                  color: AVATAR_COLORS[i % AVATAR_COLORS.length],
                                }}
                              >
                                {getInitials(u.name)}
                              </div>
                              <div>
                                <div className="ap-user-name">{u.name}</div>
                                <div className="ap-user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ap-badge ${u.isSubscribed ? "ap-badge--sub" : "ap-badge--free"}`}>
                              {u.isSubscribed ? "★ Pro" : "Free"}
                            </span>
                          </td>
                          <td>
                            <span className={`ap-badge ${u.isActive ? "ap-badge--active" : "ap-badge--inactive"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="ap-date">
                            {new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                          <td>
                            <div className="ap-actions">
                              <button className="ap-act-btn ap-act-btn--toggle" onClick={() => handleToggleSub(u._id)}>
                                {u.isSubscribed ? "Unsub" : "Sub"}
                              </button>
                              <button className="ap-act-btn ap-act-btn--status" onClick={() => handleToggleActive(u._id)}>
                                {u.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button className="ap-act-btn ap-act-btn--delete" onClick={() => handleDelete(u._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}