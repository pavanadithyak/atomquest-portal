import React, { useState, useEffect } from "react";
import { getDashboard } from "../api/admin";

function MetricCard({ title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${color || "text-gray-800"}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Phase Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Submitted"
          value={data.phase1?.goals_submitted || 0}
          color="text-blue-600"
        />
        <MetricCard
          title="Approved"
          value={data.phase1?.goals_approved || 0}
          color="text-green-600"
        />
        <MetricCard
          title="Pending"
          value={data.phase1?.goals_pending || 0}
          color="text-yellow-600"
        />
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Quarterly Achievements <span className="text-sm font-normal text-gray-400">({data.current_quarter})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Submitted"
          value={data.quarter_status?.achievements_submitted || 0}
          color="text-indigo-600"
          subtitle={`out of ${data.quarter_status?.achievements_total || 0} total`}
        />
      </div>
    </div>
  );
}
