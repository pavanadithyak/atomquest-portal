import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createGoalSheet, updateGoalSheet, getGoalSheet, getCycles } from "../api/goals";

const UOM_OPTIONS = [
  { value: "numeric", label: "Numeric" },
  { value: "percentage", label: "Percentage" },
  { value: "timeline", label: "Timeline" },
  { value: "zero_based", label: "Zero Based" },
];

const emptyGoal = () => ({
  thrust_area: "",
  title: "",
  description: "",
  uom_type: "numeric",
  target_value: "",
  weightage: "",
});

export default function GoalEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [goals, setGoals] = useState([emptyGoal()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  useEffect(() => {
    getCycles()
      .then((data) => {
        setCycles(data);
        if (data.length > 0) setCycleId(data[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      getGoalSheet(id)
        .then((sheet) => {
          setCycleId(sheet.cycle_id);
          if (sheet.goals?.length > 0) {
            setGoals(
              sheet.goals.map((g) => ({
                thrust_area: g.thrust_area || "",
                title: g.title || "",
                description: g.description || "",
                uom_type: g.uom_type || "numeric",
                target_value: g.target_value?.toString() || "",
                weightage: g.weightage?.toString() || "",
              }))
            );
          }
        })
        .catch((err) => setError(err.response?.data?.error || "Failed to load goal sheet"));
    }
  }, [id, isEdit]);

  const totalWeightage = goals.reduce((sum, g) => sum + parseFloat(g.weightage || 0), 0);
  const weightageError = Math.abs(totalWeightage - 100) > 0.01;
  const minWeightageError = goals.some(
    (g) => g.weightage && parseFloat(g.weightage) < 10
  );
  const invalidGoal = goals.some(
    (g) => !g.title || !g.target_value || !g.weightage
  );
  const canSubmit =
    !submitting &&
    !invalidGoal &&
    !weightageError &&
    !minWeightageError &&
    goals.length >= 1 &&
    goals.length <= 8 &&
    cycleId;

  const handleGoalChange = (index, field, value) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const addGoal = () => {
    if (goals.length < 8) {
      setGoals([...goals, emptyGoal()]);
    }
  };

  const removeGoal = (index) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const handleBlur = (index, field) => {
    setTouched({ ...touched, [`${index}-${field}`]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        cycle_id: parseInt(cycleId),
        goals: goals.map((g) => ({
          thrust_area: g.thrust_area,
          title: g.title,
          description: g.description,
          uom_type: g.uom_type,
          target_value: parseFloat(g.target_value),
          weightage: parseFloat(g.weightage),
        })),
      };

      if (isEdit) {
        await updateGoalSheet(id, payload);
      } else {
        await createGoalSheet(payload);
      }
      navigate("/goals");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save goal sheet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? "Edit Goal Sheet" : "New Goal Sheet"}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cycle</label>
          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select cycle...</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.phase_name} ({c.start_date} - {c.end_date})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Goal #{index + 1}</h3>
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thrust Area
                  </label>
                  <input
                    type="text"
                    value={goal.thrust_area}
                    onChange={(e) => handleGoalChange(index, "thrust_area", e.target.value)}
                    onBlur={() => handleBlur(index, "thrust_area")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Product Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) => handleGoalChange(index, "title", e.target.value)}
                    onBlur={() => handleBlur(index, "title")}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Goal title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={goal.description}
                    onChange={(e) => handleGoalChange(index, "description", e.target.value)}
                    onBlur={() => handleBlur(index, "description")}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UoM Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={goal.uom_type}
                    onChange={(e) => handleGoalChange(index, "uom_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UOM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={goal.target_value}
                    onChange={(e) => handleGoalChange(index, "target_value", e.target.value)}
                    onBlur={() => handleBlur(index, "target_value")}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weightage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max="100"
                    value={goal.weightage}
                    onChange={(e) => handleGoalChange(index, "weightage", e.target.value)}
                    onBlur={() => handleBlur(index, "weightage")}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      touched[`${index}-weightage`] && goal.weightage && parseFloat(goal.weightage) < 10
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Min. 10%"
                  />
                  {touched[`${index}-weightage`] && goal.weightage && parseFloat(goal.weightage) < 10 && (
                    <p className="text-red-500 text-xs mt-1">Minimum 10% required</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {goals.length < 8 && (
          <button
            type="button"
            onClick={addGoal}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors font-medium"
          >
            + Add Goal ({goals.length}/8)
          </button>
        )}

        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              Total Weightage:{" "}
              <span className={weightageError ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                {totalWeightage.toFixed(2)}%
              </span>
            </span>
            {minWeightageError && (
              <span className="text-red-500 text-sm">All goals must be ≥10%</span>
            )}
            {weightageError && (
              <span className="text-red-500 text-sm">Must equal 100%</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : isEdit ? "Update Goal Sheet" : "Create Goal Sheet"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/goals")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
