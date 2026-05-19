import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getGoalSheet, submitGoalSheet, deleteGoalSheet } from "../api/goals";
import { useAuth } from "../context/AuthContext";

export default function GoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getGoalSheet(id)
      .then(setSheet)
      .catch((err) => setError(err.response?.data?.error || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!window.confirm("Submit this goal sheet for approval?")) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await submitGoalSheet(id);
      setSheet(result.goalSheet);
    } catch (err) {
      setError(err.response?.data?.error || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this goal sheet?")) return;
    try {
      await deleteGoalSheet(id);
      navigate("/goals");
    } catch (err) {
      setError(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!sheet) {
    return <div className="text-center py-20 text-red-500">Goal sheet not found</div>;
  }

  const totalWeight = sheet.goals?.reduce((s, g) => s + parseFloat(g.weightage || 0), 0) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/goals" className="text-blue-600 hover:underline text-sm">&larr; Back to Goals</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Goal Sheet #{sheet.id}</h1>
        </div>
        <div className="flex space-x-2">
          {sheet.status === "draft" && (
            <>
              <Link
                to={`/goals/${sheet.id}/edit`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Edit
              </Link>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for Approval"}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Delete
              </button>
            </>
          )}
          {sheet.status === "draft" && user?.role !== "admin" && (
            <Link
              to={`/goals/${sheet.id}/achievements`}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Achievements
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className="font-semibold capitalize">{sheet.status}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cycle</span>
            <p className="font-semibold">{sheet.cycle_id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Total Weightage</span>
            <p className={`font-semibold ${totalWeight === 100 ? "text-green-600" : "text-red-600"}`}>
              {totalWeight}%
            </p>
          </div>
        </div>

        {sheet.employee && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">Employee</span>
            <p className="font-semibold">
              {sheet.employee.first_name} {sheet.employee.last_name}
            </p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Goals</h2>
      <div className="space-y-4">
        {sheet.goals?.map((goal, index) => (
          <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">
                #{index + 1} {goal.title}
              </h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {goal.weightage}%
              </span>
            </div>
            {goal.thrust_area && (
              <p className="text-sm text-gray-500 mb-1">Thrust Area: {goal.thrust_area}</p>
            )}
            {goal.description && (
              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
            )}
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>UoM: {goal.uom_type}</span>
              <span>Target: {goal.target_value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
