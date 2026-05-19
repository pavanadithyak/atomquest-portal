import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (path) =>
    `px-3 py-2 rounded text-sm font-medium transition-colors ${
      location.pathname.startsWith(path)
        ? "bg-blue-700 text-white"
        : "text-blue-100 hover:bg-blue-600 hover:text-white"
    }`;

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white font-bold text-lg">
              AtomQuest
            </Link>
            <div className="hidden md:flex space-x-2">
              <Link to="/goals" className={linkClass("/goals")}>
                My Goals
              </Link>
              {(user?.role === "manager" || user?.role === "admin") && (
                <>
                  <Link to="/approvals" className={linkClass("/approvals")}>
                    Approvals
                  </Link>
                  <Link to="/check-ins" className={linkClass("/check-ins")}>
                    Check-ins
                  </Link>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <Link to="/admin" className={linkClass("/admin")}>
                    Admin
                  </Link>
                  <Link to="/admin/audit-logs" className={linkClass("/admin/audit-logs")}>
                    Audit Logs
                  </Link>
                  <Link to="/admin/reports" className={linkClass("/admin/reports")}>
                    Reports
                  </Link>
                  <Link to="/admin/shared-goals" className={linkClass("/admin/shared-goals")}>
                    Shared Goals
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-blue-200 text-sm">
              {user?.first_name} {user?.last_name} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            <Link to="/goals" className={`block px-3 py-2 rounded text-sm ${isActive("/goals") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
              My Goals
            </Link>
            {(user?.role === "manager" || user?.role === "admin") && (
              <>
                <Link to="/approvals" className={`block px-3 py-2 rounded text-sm ${isActive("/approvals") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
                  Approvals
                </Link>
                <Link to="/check-ins" className={`block px-3 py-2 rounded text-sm ${isActive("/check-ins") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
                  Check-ins
                </Link>
              </>
            )}
            {user?.role === "admin" && (
              <>
                <Link to="/admin" className={`block px-3 py-2 rounded text-sm ${isActive("/admin") && !isActive("/admin/audit-logs") && !isActive("/admin/reports") && !isActive("/admin/shared-goals") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
                <Link to="/admin/audit-logs" className={`block px-3 py-2 rounded text-sm ${isActive("/admin/audit-logs") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
                  Audit Logs
                </Link>
                <Link to="/admin/reports" className={`block px-3 py-2 rounded text-sm ${isActive("/admin/reports") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
                  Reports
                </Link>
                <Link to="/admin/shared-goals" className={`block px-3 py-2 rounded text-sm ${isActive("/admin/shared-goals") ? "bg-blue-700 text-white" : "text-blue-100"}`} onClick={() => setMenuOpen(false)}>
                  Shared Goals
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-blue-600">
              <span className="block px-3 py-2 text-sm text-blue-200">{user?.email}</span>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-blue-600 rounded">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
