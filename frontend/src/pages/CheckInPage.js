import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckIn, getCheckIns } from "../api/checkins";
import { getGoalSheets } from "../api/goals";
import { useAuth } from "../context/AuthContext";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const CONFIDENCE_LEVELS = ["low", "medium", "high"];

export default function CheckInPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    goal_id: "",
    quarter: QUARTERS[0],
    manager_comment: "",
    confidence_level: "medium",
    support_needed: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getGoalSheets().then((sheets) => {
      const empMap = new Map();
      const allGoals = [];
      sheets.forEach((sheet) => {
        if (sheet.employee) {
          empMap.set(sheet.employee.id, sheet.employee);
        }
        if (sheet.goals && sheet.status === "approved") {
          sheet.goals.forEach((g) => {
            allGoals.push({ ...g, employee_id: sheet.employee_id });
          });
        }
      });
      setEmployees(Array.from(empMap.values()));
      setGoals(allGoals);
    }).catch(() => {});
  }, []);

  const filteredGoals = goals.filter((g) => g.employee_id === parseInt(form.employee_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createCheckIn({
        goal_id: parseInt(form.goal_id),
        employee_id: parseInt(form.employee_id),
        quarter: form.quarter,
        manager_comment: form.manager_comment,
        confidence_level: form.confidence_level,
        support_needed: form.support_needed,
      });
      setSuccess("Check-in created successfully");
      setTimeout(() => navigate("/check-ins"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create check-in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Check-In</h1>

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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value, goal_id: "" })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
            <select
              value={form.goal_id}
              onChange={(e) => setForm({ ...form, goal_id: e.target.value })}
              required
              disabled={!form.employee_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select goal...</option>
              {filteredGoals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Comment</label>
            <textarea
              value={form.manager_comment}
              onChange={(e) => setForm({ ...form, manager_comment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Feedback on progress..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Level</label>
            <select
              value={form.confidence_level}
              onChange={(e) => setForm({ ...form, confidence_level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONFIDENCE_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Needed</label>
            <input
              type="text"
              value={form.support_needed}
              onChange={(e) => setForm({ ...form, support_needed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Training, resources..."
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Check-In"}
        </button>
      </form>
    </div>
  );
}
