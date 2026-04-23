import { useEffect, useState } from "react";
import API from "../api/api";

function AdminDashboard() {
  const [totalPets, setTotalPets] = useState(0);
  const [adoptionStats, setAdoptionStats] = useState({ total_requests: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, statsRes] = await Promise.all([
          API.get("/pets"),
          API.get("/adoptions/stats"),
        ]);
        if (petsRes.data && petsRes.data.data) {
          setTotalPets(petsRes.data.data.length);
        }
        if (statsRes.data && statsRes.data.data) {
          setAdoptionStats(statsRes.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
      </div>

      {/* ── Stat Cards ── */}
      <div className="admin-stats-grid">
        {/* Total Pets */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <circle cx="4.5" cy="9.5" r="2.5" />
                <circle cx="9" cy="5.5" r="2.5" />
                <circle cx="15" cy="5.5" r="2.5" />
                <circle cx="19.5" cy="9.5" r="2.5" />
                <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.0 2.09 2.35C7.61 22.56 9.34 22 10.5 20.75c.42-.49.78-1.07 1.12-1.63.1-.15.19-.31.38-.31.19 0 .28.16.38.31.33.56.7 1.14 1.12 1.63 1.16 1.25 2.89 1.81 4.27 1.25 1.07-.35 1.8-1.33 2.08-2.35.31-2.03-1.3-3.48-2.61-4.79z" />
              </svg>
            </div>
            <div className="admin-stat-trend up">
              <span>+100%</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>
          <div className="admin-stat-label">Total Pets</div>
          <div className="admin-stat-value">{totalPets}</div>
        </div>

        {/* Successful Adoptions */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon heart">
              <svg viewBox="0 0 24 24" fill="#d95040" width="22" height="22">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="admin-stat-trend down">
              <span>-0%</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="7" x2="17" y2="17" />
                <polyline points="17 7 17 17 7 17" />
              </svg>
            </div>
          </div>
          <div className="admin-stat-label">Succesful Adoptions</div>
          <div className="admin-stat-value">{adoptionStats.approved || 0}</div>
        </div>

        {/* Adoption Requests */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </div>
            <div className="admin-stat-trend down">
              <span>+100%</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="7" x2="17" y2="17" />
                <polyline points="17 7 17 17 7 17" />
              </svg>
            </div>
          </div>
          <div className="admin-stat-label">Adoption Requests</div>
          <div className="admin-stat-value">{adoptionStats.pending || 0}</div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="admin-main-grid">
        {/* Donation Analytics Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3 className="admin-chart-title">Donation Analytics</h3>
              <p className="admin-chart-subtitle">Financial Performance over last 5 months</p>
            </div>
            <select className="admin-chart-select">
              <option>5 months</option>
            </select>
          </div>
          <div className="admin-chart-area">
            {/* Placeholder chart bars */}
            <div className="admin-chart-bars">
              <div className="admin-chart-bar" style={{ height: "0%" }}></div>
              <div className="admin-chart-bar" style={{ height: "0%" }}></div>
              <div className="admin-chart-bar" style={{ height: "0%" }}></div>
              <div className="admin-chart-bar" style={{ height: "0%" }}></div>
              <div className="admin-chart-bar" style={{ height: "10%" }}></div>
            </div>
            <div className="admin-chart-labels">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-activity-card">
          <div className="admin-activity-content">
            <h3 className="admin-activity-title">Recent Activity</h3>
            <p className="admin-activity-subtitle">Real-time shelter updates</p>
            <div className="admin-activity-list">
              {[1, 2, 3].map((item) => (
                <div key={item} className="admin-activity-item">
                  <div className="admin-activity-avatar">
                    <img src="/paw-avatar.png" alt="Activity" />
                  </div>
                  <div className="admin-activity-text">
                    <span className="admin-activity-action">Admin added a pet</span>
                    <span className="admin-activity-time">{item} hr ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-activity-footer">
            View All Activity
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
