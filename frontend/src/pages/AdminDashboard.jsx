import { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import API from "../api/api";

/* ── Register Chart.js components ── */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ── Icon Components ── */

const PawIcon = () => (
  <span style={{ fontSize: "20px" }}>🐾</span>
);

const HeartIcon = () => (
  <span style={{ fontSize: "20px" }}>❤️</span>
);

const DocumentIcon = () => (
  <span style={{ fontSize: "20px" }}>📄</span>
);

const DownloadIcon = () => (
  <span style={{ fontSize: "14px" }}></span>
);



/* ── Stat Card Sub-component ── */

function StatCard({ icon, iconClass, label, value, trendText, trendDir }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <div className={`admin-stat-icon ${iconClass || ""}`}>{icon}</div>
        <div className={`admin-stat-trend ${trendDir}`}>
          <span>{trendText}</span>
        </div>
      </div>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}

/* ── Activity Icon by type ── */
function ActivityIcon({ type }) {
  const iconMap = {
    donation: "💵",
    adoption: "🐾",
    pet_added: "🏠",
  };
  return <span style={{ fontSize: "20px" }}>{iconMap[type] || "📋"}</span>;
}

/* ── Time-ago helper ── */
function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Status color helper ── */
function getStatusColor(type, status) {
  if (type === "donation") {
    if (status === "approved") return "#2e7d32";
    if (status === "rejected") return "#c62828";
    return "#e65100";
  }
  if (type === "adoption") {
    if (status === "Approved") return "#2e7d32";
    if (status === "Rejected") return "#c62828";
    return "#e65100";
  }
  return "#555";
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════════════ */

function AdminDashboard() {
  const [totalPets, setTotalPets] = useState(0);
  const [adoptionStats, setAdoptionStats] = useState({
    total_requests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [monthRange, setMonthRange] = useState(6);
  const [chartLoading, setChartLoading] = useState(false);
  const [showApproved, setShowApproved] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const chartRef = useRef(null);

  const RANGE_OPTIONS = [
    { value: 1, label: "This Month" },
    { value: 3, label: "3 Months" },
    { value: 6, label: "6 Months" },
    { value: 12, label: "12 Months" },
  ];

  /* ── Fetch core dashboard data (once on mount) ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, statsRes, activityRes] = await Promise.all([
          API.get("/pets"),
          API.get("/adoptions/stats"),
          API.get("/dashboard/activity"),
        ]);

        if (petsRes.data?.data) {
          setTotalPets(petsRes.data.data.length);
        }
        if (statsRes.data?.data) {
          setAdoptionStats(statsRes.data.data);
        }
        if (activityRes.data?.data) {
          setRecentActivity(activityRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ── Fetch monthly chart data (re-runs when monthRange changes) ── */
  useEffect(() => {
    const fetchMonthly = async () => {
      setChartLoading(true);
      try {
        const res = await API.get(`/donations/monthly?months=${monthRange}`);
        if (res.data?.data) {
          setMonthlyData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch monthly data:", err);
      } finally {
        setChartLoading(false);
      }
    };

    fetchMonthly();
  }, [monthRange]);

  /* ── Chart.js Configuration ── */
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Build labels and values for the selected month range, filling missing months with 0
  const buildChartData = () => {
    const now = new Date();
    const labels = [];
    const approvedValues = [];
    const allValues = [];

    for (let i = monthRange - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      // Show "Mon 'YY" for ranges > 6 to avoid crowding
      const label = monthRange > 6
        ? `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
        : monthNames[d.getMonth()];
      labels.push(label);

      const entry = monthlyData.find((m) => m.month === key);
      approvedValues.push(entry ? parseFloat(entry.approved_total) : 0);
      allValues.push(entry ? parseFloat(entry.all_total) : 0);
    }

    return { labels, approvedValues, allValues };
  };

  const { labels, approvedValues, allValues } = buildChartData();

  const chartData = {
    labels,
    datasets: [
      showApproved && {
        label: "Approved Donations (₱)",
        data: approvedValues,
        backgroundColor: "rgba(46, 125, 50, 0.7)",
        borderColor: "rgba(46, 125, 50, 1)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      showAll && {
        label: "All Donations (₱)",
        data: allValues,
        backgroundColor: "rgba(182, 61, 26, 0.25)",
        borderColor: "rgba(182, 61, 26, 0.6)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ].filter(Boolean),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(26, 26, 26, 0.9)",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ₱${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: {
          font: { size: 11 },
          color: "#888",
          callback: (val) => `₱${val.toLocaleString()}`,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12, weight: "bold" },
          color: "#555",
        },
      },
    },
  };

  /* ── CSV Export Handler ── */
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await API.get(`/donations/export/csv?months=${monthRange}`, {
        responseType: "blob",
      });
      const rangeLabel = RANGE_OPTIONS.find((o) => o.value === monthRange)?.label || "report";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `donations_${rangeLabel.replace(/\s+/g, "_").toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export donations report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
        <p style={{ color: "#888", margin: "4px 7 0 0", fontSize: "14px" }}>
          Real-time insights from your shelter data
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="admin-stats-grid">
        <StatCard
          icon={<PawIcon />}
          label="Total Pets"
          value={totalPets}
          trendDir="up"
        />
        <StatCard
          icon={<HeartIcon />}
          iconClass="heart"
          label="Successful Adoptions"
          value={adoptionStats.approved || 0}
          trendDir="down"
        />
        <StatCard
          icon={<DocumentIcon />}
          label="Adoption Requests"
          value={adoptionStats.pending || 0}
          trendDir="down"
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="admin-main-grid">
        {/* Donation Analytics Chart — powered by Chart.js */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3 className="admin-chart-title">Donation Analytics</h3>
              <p className="admin-chart-subtitle">
                Financial performance — {RANGE_OPTIONS.find((o) => o.value === monthRange)?.label || "6 Months"}
              </p>
            </div>
            <div className="admin-chart-controls">
              <select
                className="admin-chart-select"
                value={monthRange}
                onChange={(e) => setMonthRange(Number(e.target.value))}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                className="admin-export-btn"
                onClick={handleExportCSV}
                disabled={exporting}
                title="Export donation report as CSV"
              >
                <DownloadIcon />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>

          {/* Dataset toggle checkboxes */}
          <div className="admin-chart-toggles">
            <label className="admin-chart-toggle">
              <input
                type="checkbox"
                checked={showApproved}
                onChange={() => setShowApproved((v) => !v)}
              />
              Approved Donations
            </label>
            <label className="admin-chart-toggle">
              <input
                type="checkbox"
                checked={showAll}
                onChange={() => setShowAll((v) => !v)}
              />
              All Donations
            </label>
          </div>

          <div className="admin-chartjs-container">
            {chartLoading ? (
              <div className="admin-chart-empty">
                <div className="findpets-spinner" style={{ width: 32, height: 32 }} />
                <p>Loading chart data...</p>
              </div>
            ) : monthlyData.length === 0 && !activityLoading ? (
              <div className="admin-chart-empty">
                <span>📊</span>
                <p>No donation data available yet</p>
              </div>
            ) : (
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            )}
          </div>

          {/* Summary row under chart */}
          <div className="admin-chart-summary">
            <div className="admin-chart-summary-item">
              <span className="admin-chart-summary-label">
                Approved ({RANGE_OPTIONS.find((o) => o.value === monthRange)?.label})
              </span>
              <span className="admin-chart-summary-value approved">
                ₱{approvedValues.reduce((a, b) => a + b, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="admin-chart-summary-item">
              <span className="admin-chart-summary-label">
                Submitted ({RANGE_OPTIONS.find((o) => o.value === monthRange)?.label})
              </span>
              <span className="admin-chart-summary-value">
                ₱{allValues.reduce((a, b) => a + b, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="admin-chart-summary-item">
              <span className="admin-chart-summary-label">Latest Month</span>
              <span className="admin-chart-summary-value highlight">
                ₱{(approvedValues[approvedValues.length - 1] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity — dynamic from database */}
        <div className="admin-activity-card">
          <div className="admin-activity-content">
            <h3 className="admin-activity-title">Recent Activity</h3>
            <p className="admin-activity-subtitle">Real-time shelter updates</p>

            <div className="admin-activity-list">
              {activityLoading ? (
                <div className="admin-activity-loading">
                  <div className="findpets-spinner" style={{ width: 28, height: 28 }} />
                  <span>Loading activity...</span>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="admin-activity-empty">
                  <span>📋</span>
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="admin-activity-item">
                    <div
                      className="admin-activity-avatar"
                      style={{
                        backgroundColor:
                          item.type === "donation"
                            ? "#e8f5e9"
                            : item.type === "adoption"
                              ? "#fff3e0"
                              : "#e3f2fd",
                      }}
                    >
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="admin-activity-text">
                      <span className="admin-activity-action">{item.description}</span>
                      <div className="admin-activity-meta">
                        <span
                          className="admin-activity-status"
                          style={{ color: getStatusColor(item.type, item.status) }}
                        >
                          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                        </span>
                        <span className="admin-activity-time">{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
