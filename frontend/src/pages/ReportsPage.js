import React, { useState } from "react";
import { getReport } from "../api/admin";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const downloadCSV = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const blob = await getReport(null, "csv");
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `achievement_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess("CSV report downloaded successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await getReport(null, "json");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `achievement_report_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess("JSON report downloaded successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Achievement Report</h2>
        <p className="text-sm text-gray-500 mb-6">
          Download a report of all goal sheets, goals, and achievements across all cycles.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={downloadCSV}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download CSV"}
          </button>
          <button
            onClick={downloadJSON}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}
