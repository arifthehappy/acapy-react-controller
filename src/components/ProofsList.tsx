import React, { useState } from "react";
import { useProofs } from "../hooks/useProofs";
import { RequestProofSection } from "./proofs/RequestProofSection";
import { RespondToProofSection } from "./proofs/RespondToProofSection";
import { Shield, Send } from "lucide-react";

export const ProofsList = () => {
  const [activeTab, setActiveTab] = useState<"request" | "respond">("request");
  const { data: proofs = [], isLoading, error } = useProofs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="text-red-700">
          Error loading proofs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proof Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("request")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "request"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Shield size={20} />
            <span>Request Proof</span>
          </button>
          <button
            onClick={() => setActiveTab("respond")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "respond"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Send size={20} />
            <span>Respond to Proof Request</span>
          </button>
        </div>
      </div>

      {activeTab === "request" ? (
        <RequestProofSection proofs={proofs} />
      ) : (
        <RespondToProofSection proofs={proofs} />
      )}
    </div>
  );
};
