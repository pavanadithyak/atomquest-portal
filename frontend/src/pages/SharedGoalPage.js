import React, { useState, useEffect } from "react";
import { pushSharedGoal, getUsers } from "../api/admin";
import { getCycles } from "../api/goals";

const UOM_OPTIONS = [
  { value: "numeric", label: "Numeric" },
  { value: "percentage", label: "Percentage" },
  { value: "timeline", label: "Timeline" },
  { value: "zero_based", label: "Zero Based" },
];

export default function SharedGoalPage() {
  const [users, setUsers] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [goalTemplate, setGoalTemplate] = useState({
    thrust_area: "",
    title: "",
    description: "",
    uom_type: "numeric",
    target_value: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data.filter((u) => u.role === "employee")))
      .catch(() => {});
  }, []);

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedEmployees.length === users.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(users.map((u) => u.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (selectedEmployees.length === 0) {
        throw new Error("Select at least one employee");
      }
      if (!goalTemplate.title || !goalTemplate.target_value) {
        throw new Error("Title and target value are required");
      }

      const result = await pushSharedGoal({
        goal_template: {
          thrust_area: goalTemplate.thrust_area,
          title: goalTemplate.title,
          description: goalTemplate.description,
          uom_type: goalTemplate.uom_type,
          target_value: parseFloat(goalTemplate.target_value),
        },
        recipient_employee_ids: selectedEmployees,
      });

      setSuccess(`Shared goal pushed to ${result.recipient_count} employee(s)`);
      setSelectedEmployees([]);
      setGoalTemplate({ thrust_area: "", title: "", description: "", uom_type: "numeric", target_value: "" });
    } catch (err) {
      setError(err.message || err.response?.data?.error || "Failed to push shared goal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Push Shared Goals</h1>

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

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Goal Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thrust Area</label>
              <input
                type="text"
                value={goalTemplate.thrust_area}
                onChange={(e) => setGoalTemplate({ ...goalTemplate, thrust_area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Compliance Training"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={goalTemplate.title}
                onChange={(e) => setGoalTemplate({ ...goalTemplate, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Shared goal title"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={goalTemplate.description}
                onChange={(e) => setGoalTemplate({ ...goalTemplate, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UoM Type *</label>
              <select
                value={goalTemplate.uom_type}
                onChange={(e) => setGoalTemplate({ ...goalTemplate, uom_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Value *</label>
              <input
                type="number"
                step="0.01"
                value={goalTemplate.target_value}
                onChange={(e) => setGoalTemplate({ ...goalTemplate, target_value: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Recipient Employees ({selectedEmployees.length} selected)
            </h2>
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-blue-600 hover:underline"
            >
              {selectedEmployees.length === users.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          {users.length === 0 ? (
            <p className="text-sm text-gray-400">No employees found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {users.map((u) => (
                <label
                  key={u.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmployees.includes(u.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(u.id)}
                    onChange={() => toggleEmployee(u.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {u.first_name} {u.last_name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || selectedEmployees.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {submitting ? "Pushing..." : "Push Shared Goal"}
        </button>
      </form>
    </div>
  );
}
