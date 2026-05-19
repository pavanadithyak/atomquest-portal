import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getGoalSheets } from "../api/goals";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function GoalSheetCard({ sheet }) {
  const totalWeight = sheet.goals?.reduce((s, g) => s + parseFloat(g.weightage || 0), 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[sheet.status] || "bg-gray-100 text-gray-700"}`}>
            {sheet.status}
          </span>
          <span className="ml-2 text-sm text-gray-500">Cycle: {sheet.cycle_id}</span>
        </div>
        <span className="text-sm text-gray-400">
          {new Date(sheet.created_at).toLocaleDateString()}
        </span>
      </div>

      {sheet.goals?.length > 0 ? (
        <div className="space-y-2">
          {sheet.goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate flex-1">{goal.title}</span>
              <span className="text-gray-500 ml-2">{goal.weightage}%</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between text-sm font-medium">
            <span className="text-gray-600">Total</span>
            <span className={totalWeight === 100 ? "text-green-600" : "text-red-600"}>
              {totalWeight}%
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No goals defined</p>
      )}

      <div className="mt-4 flex space-x-2">
        <Link
          to={`/goals/${sheet.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          View
        </Link>
        {sheet.status === "draft" && (
          <>
            <Link
              to={`/goals/${sheet.id}/edit`}
              className="text-sm text-indigo-600 hover:underline"
            >
              Edit
            </Link>
            <Link
              to={`/goals/${sheet.id}/achievements`}
              className="text-sm text-green-600 hover:underline"
            >
              Achievements
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function MyGoalsPage() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getGoalSheets()
      .then(setSheets)
      .catch((err) => setError(err.response?.data?.error || "Failed to load goals"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading goal sheets...</div>;
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Goal Sheets</h1>
        <Link
          to="/goals/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Goal Sheet
        </Link>
      </div>

      {sheets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No goal sheets yet</p>
          <Link
            to="/goals/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create Your First Goal Sheet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheets.map((sheet) => (
            <GoalSheetCard key={sheet.id} sheet={sheet} />
          ))}
        </div>
      )}
    </div>
  );
}
