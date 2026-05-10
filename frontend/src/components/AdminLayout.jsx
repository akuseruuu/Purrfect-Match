import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../assets/Admin.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {/* Sidebar + mobile overlay */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
