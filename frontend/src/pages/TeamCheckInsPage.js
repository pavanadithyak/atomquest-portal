import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCheckIns } from "../api/checkins";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const confidenceColors = {
  low: "text-red-600 bg-red-50",
  medium: "text-yellow-600 bg-yellow-50",
  high: "text-green-600 bg-green-50",
};

export default function TeamCheckInsPage() {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quarter, setQuarter] = useState("");

  const fetchCheckIns = (q) => {
    setLoading(true);
    getCheckIns(q || undefined)
      .then(setCheckIns)
      .catch((err) => setError(err.response?.data?.error || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchCheckIns(quarter);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Check-Ins</h1>
        <Link
          to="/check-ins/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Check-In
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleFilter} className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-end space-x-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Quarter</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Quarters</option>
              {QUARTERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            Filter
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading check-ins...</div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No check-ins found</p>
          <Link
            to="/check-ins/new"
            className="inline-block mt-4 text-blue-600 hover:underline text-sm"
          >
            Create your first check-in
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {checkIns.map((ci) => (
            <div key={ci.id} className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {ci.goal?.title || `Goal #${ci.goal_id}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quarter: {ci.quarter} &middot; Employee ID: {ci.employee_id}
                  </p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${confidenceColors[ci.confidence_level] || "bg-gray-100 text-gray-600"}`}>
                  {ci.confidence_level || "N/A"}
                </span>
              </div>

              {ci.manager_comment && (
                <p className="text-sm text-gray-600 mb-2 italic">"{ci.manager_comment}"</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Created: {new Date(ci.created_at || ci.createdAt).toLocaleDateString()}
                </span>
                {ci.support_needed && (
                  <span>Support: {ci.support_needed}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
