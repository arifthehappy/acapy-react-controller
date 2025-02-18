import React, { useState } from "react";
import { useConnections } from "../../hooks/useConnections";
import { DelegationForm } from "./DelegationForm";
import { DelegationList } from "./DelegationList";
import { connections } from "../../api/agent";
import { Users, MessageSquare } from "lucide-react";

export const DelegationPage = () => {
  const [activeTab, setActiveTab] = useState<"new" | "list">("new");
  const { data: connectionsList = [], isLoading } = useConnections();

  // Filter connections that support delegation
  const delegationSupportedConnections = connectionsList.filter(
    (conn: any) => conn.state === "active"
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Credential Delegation</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "new"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <MessageSquare size={20} />
            <span>New Delegation</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "list"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users size={20} />
            <span>Delegation History</span>
          </button>
        </div>
      </div>

      {activeTab === "new" ? (
        <DelegationForm connections={delegationSupportedConnections} />
      ) : (
        <DelegationList />
      )}
    </div>
  );
};
