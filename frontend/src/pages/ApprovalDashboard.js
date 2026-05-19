import React, { useState, useEffect } from "react";
import { getPendingApprovals, approveSheet, rejectSheet } from "../api/manager";

function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        {children}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${confirmColor || "bg-blue-600 hover:bg-blue-700"}`}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalDashboard() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [modal, setModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPending = () => {
    setLoading(true);
    getPendingApprovals()
      .then(setSheets)
      .catch((err) => setError(err.response?.data?.error || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = (id) => {
    setModal({ type: "approve", id });
    setRejectReason("");
  };

  const handleReject = (id) => {
    setModal({ type: "reject", id });
    setRejectReason("");
  };

  const confirmAction = async () => {
    setActionMsg("");
    try {
      if (modal.type === "approve") {
        await approveSheet(modal.id);
        setActionMsg("Goal sheet approved successfully");
      } else {
        await rejectSheet(modal.id, rejectReason);
        setActionMsg("Goal sheet rejected");
      }
      setModal(null);
      setSheets((prev) => prev.filter((s) => s.id !== modal.id));
    } catch (err) {
      setError(err.response?.data?.error || "Action failed");
      setModal(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading pending approvals...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pending Approvals</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {actionMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
          {actionMsg}
        </div>
      )}

      {sheets.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No pending approvals</p>
          <p className="text-sm mt-1">All goal sheets have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {sheet.employee?.first_name} {sheet.employee?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Goal Sheet #{sheet.id} &middot; Cycle #{sheet.cycle_id}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(sheet.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {sheet.goals?.map((goal, i) => (
                  <div key={goal.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">
                        #{i + 1} {goal.title}
                      </span>
                      {goal.thrust_area && (
                        <span className="text-gray-400 ml-2">({goal.thrust_area})</span>
                      )}
                    </div>
                    <span className="text-gray-500 ml-2">{goal.weightage}%</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleReject(sheet.id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(sheet.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ConfirmModal
          title={modal.type === "approve" ? "Approve Goal Sheet" : "Reject Goal Sheet"}
          message={
            modal.type === "approve"
              ? "This will lock the goal sheet and approve all goals."
              : "Provide a reason for rejection (optional)."
          }
          confirmLabel={modal.type === "approve" ? "Approve" : "Reject"}
          confirmColor={modal.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          onConfirm={confirmAction}
          onCancel={() => setModal(null)}
        >
          {modal.type === "reject" && (
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
