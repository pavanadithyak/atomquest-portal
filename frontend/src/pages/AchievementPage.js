import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getGoalSheet } from "../api/goals";
import { getAchievements, createAchievement } from "../api/achievements";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const STATUS_OPTIONS = ["on_track", "at_risk", "behind", "completed"];

export default function AchievementPage() {
  const { goalSheetId } = useParams();
  const [sheet, setSheet] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    goal_id: "",
    quarter: QUARTERS[0],
    actual_value: "",
    status: "on_track",
    employee_comments: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getGoalSheet(goalSheetId),
      getAchievements(),
    ])
      .then(([sheetData, achievementData]) => {
        setSheet(sheetData);
        setAchievements(achievementData);
      })
      .catch((err) => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [goalSheetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const achievement = await createAchievement({
        goal_id: parseInt(form.goal_id),
        quarter: form.quarter,
        actual_value: parseFloat(form.actual_value),
        status: form.status,
        employee_comments: form.employee_comments,
      });
      setAchievements((prev) => [...prev, achievement]);
      setSuccess("Achievement recorded");
      setForm({ ...form, goal_id: "", actual_value: "", employee_comments: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record achievement");
    } finally {
      setSubmitting(false);
    }
  };

  const sheetAchievements = achievements.filter(
    (a) => sheet?.goals?.some((g) => g.id === a.goal_id)
  );

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!sheet) {
    return <div className="text-center py-20 text-red-500">Goal sheet not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/goals/${goalSheetId}`} className="text-blue-600 hover:underline text-sm">
          &larr; Back to Goal Sheet
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">
          Achievements - Goal Sheet #{goalSheetId}
        </h1>
      </div>

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Record Achievement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
              <select
                value={form.goal_id}
                onChange={(e) => setForm({ ...form, goal_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select goal...</option>
                {sheet.goals?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} (target: {g.target_value}, weight: {g.weightage}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quarter *</label>
              <select
                value={form.quarter}
                onChange={(e) => setForm({ ...form, quarter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {QUARTERS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Value *</label>
              <input
                type="number"
                step="0.01"
                value={form.actual_value}
                onChange={(e) => setForm({ ...form, actual_value: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <textarea
                value={form.employee_comments}
                onChange={(e) => setForm({ ...form, employee_comments: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !form.goal_id}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "Recording..." : "Record Achievement"}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Submitted Achievements</h2>
      {sheetAchievements.length === 0 ? (
        <p className="text-gray-500 text-sm">No achievements recorded yet</p>
      ) : (
        <div className="space-y-3">
          {sheetAchievements.map((a) => (
            <div key={a.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-700">{a.goal?.title || `Goal #${a.goal_id}`}</span>
                  <span className="ml-2 text-sm text-gray-500">Quarter: {a.quarter}</span>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  a.status === "completed" ? "bg-green-100 text-green-700" :
                  a.status === "on_track" ? "bg-blue-100 text-blue-700" :
                  a.status === "at_risk" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {a.status?.replace("_", " ")}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-x-4">
                <span>Actual: {a.actual_value}</span>
                <span>Progress: {a.progress_score !== null ? `${(a.progress_score * 100).toFixed(0)}%` : "-"}</span>
              </div>
              {a.employee_comments && (
                <p className="text-sm text-gray-600 mt-1 italic">{a.employee_comments}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
