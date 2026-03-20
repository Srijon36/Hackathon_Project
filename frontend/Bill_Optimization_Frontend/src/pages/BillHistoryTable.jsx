import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { deleteBill, getBillById } from "../Reducer/BillSlice";
import { useNavigate } from "react-router-dom";

const BillHistoryTable = ({ bills }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Filter State ──────────────────────────────
  const [filters, setFilters] = useState({
    month:        "",
    consumerType: "",
    status:       "",
    minAmount:    "",
    maxAmount:    "",
    search:       "",
  });

  const [sortBy,    setSortBy]    = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page,      setPage]      = useState(1);
  const rowsPerPage = 5;

  // ── Filter + Sort Logic ───────────────────────
  const filtered = useMemo(() => {
    let result = [...bills];

    // search by name or consumer number
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.customerName?.toLowerCase().includes(q) ||
          b.consumerNumber?.toLowerCase().includes(q)
      );
    }

    // filter by month
    if (filters.month) {
      result = result.filter((b) =>
        b.billMonth?.toLowerCase().includes(filters.month.toLowerCase())
      );
    }

    // filter by consumer type
    if (filters.consumerType) {
      result = result.filter((b) => b.consumerType === filters.consumerType);
    }

    // filter by payment status
    if (filters.status) {
      result = result.filter((b) => b.paymentStatus === filters.status);
    }

    // filter by amount range
    if (filters.minAmount) {
      result = result.filter((b) => (b.netAmount || 0) >= Number(filters.minAmount));
    }
    if (filters.maxAmount) {
      result = result.filter((b) => (b.netAmount || 0) <= Number(filters.maxAmount));
    }

    // sort
    result.sort((a, b) => {
      let valA = a[sortBy] || 0;
      let valB = b[sortBy] || 0;
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [bills, filters, sortBy, sortOrder]);

  // ── Pagination ────────────────────────────────
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // reset to page 1 on filter change
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      await dispatch(deleteBill(id));
    }
  };

  const handleView = (id) => {
    dispatch(getBillById(id));
    navigate(`/bill/${id}`);
  };

  const handleReset = () => {
    setFilters({
      month: "", consumerType: "", status: "",
      minAmount: "", maxAmount: "", search: "",
    });
    setPage(1);
  };

  const statusColor = (status) => {
    if (status === "Paid")    return "#10b981";
    if (status === "Overdue") return "#ef4444";
    return "#f59e0b";
  };

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: "4px", color: sortBy === field ? "#3b82f6" : "#94a3b8" }}>
      {sortBy === field ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  if (!bills || bills.length === 0) return null;

  return (
    <div className="chart-card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3>📋 Bill History</h3>
        <span style={{ color: "#64748b", fontSize: "14px" }}>
          {filtered.length} of {bills.length} bills
        </span>
      </div>

      {/* ── Filters ────────────────────────────── */}
      <div className="filters-row">

        <input
          className="filter-input"
          type="text"
          name="search"
          placeholder="🔍 Search name / consumer no."
          value={filters.search}
          onChange={handleFilterChange}
        />

        <input
          className="filter-input"
          type="text"
          name="month"
          placeholder="📅 Bill month (e.g. 02/2025)"
          value={filters.month}
          onChange={handleFilterChange}
        />

        <select
          className="filter-input"
          name="consumerType"
          value={filters.consumerType}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="Domestic">Domestic</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
        </select>

        <select
          className="filter-input"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>

        <input
          className="filter-input"
          type="number"
          name="minAmount"
          placeholder="₹ Min amount"
          value={filters.minAmount}
          onChange={handleFilterChange}
        />

        <input
          className="filter-input"
          type="number"
          name="maxAmount"
          placeholder="₹ Max amount"
          value={filters.maxAmount}
          onChange={handleFilterChange}
        />

        <button className="btn-reset" onClick={handleReset}>
          ✕ Reset
        </button>
      </div>

      {/* ── Table ──────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No bills match your filters
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="bill-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("billMonth")}    style={{ cursor: "pointer" }}>Month <SortIcon field="billMonth" /></th>
                  <th onClick={() => handleSort("customerName")} style={{ cursor: "pointer" }}>Customer <SortIcon field="customerName" /></th>
                  <th>Consumer No.</th>
                  <th>Type</th>
                  <th onClick={() => handleSort("unitsBilled")}  style={{ cursor: "pointer" }}>Units <SortIcon field="unitsBilled" /></th>
                  <th onClick={() => handleSort("netAmount")}    style={{ cursor: "pointer" }}>Amount <SortIcon field="netAmount" /></th>
                  <th onClick={() => handleSort("dueDate")}      style={{ cursor: "pointer" }}>Due Date <SortIcon field="dueDate" /></th>
                  <th onClick={() => handleSort("paymentStatus")} style={{ cursor: "pointer" }}>Status <SortIcon field="paymentStatus" /></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.billMonth || "N/A"}</td>
                    <td>{bill.customerName || "N/A"}</td>
                    <td>{bill.consumerNumber || "N/A"}</td>
                    <td>{bill.consumerType || "Domestic"}</td>
                    <td>{bill.unitsBilled || 0} kWh</td>
                    <td>₹{(bill.netAmount || 0).toLocaleString("en-IN")}</td>
                    <td>
                      {bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: statusColor(bill.paymentStatus) }}
                      >
                        {bill.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn-action view"
                          onClick={() => handleView(bill._id)}
                        >
                          👁 View
                        </button>
                        <button
                          className="btn-action analyse"
                          onClick={() => navigate(`/analysis/${bill._id}`)}
                        >
                          📊 Analyse
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(bill._id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────── */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                «
              </button>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
              <button
                className="page-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BillHistoryTable;