import React, { useState } from "react";
import { useCredentials } from "../hooks/useCredentials";
import { CredentialCard } from "./credentials/CredentialCard";
import { IssueCredentialSection } from "./credentials/IssueCredentialSection";
import { RequestCredentialSection } from "./credentials/RequestCredentialSection";
import { WalletSection } from "./credentials/WalletSection.tsx";
import { Wallet, SendHorizontal, Download } from "lucide-react";

export const CredentialsList = () => {
  const { data: credentials = [], isLoading, error } = useCredentials();
  console.log("Credentials:", credentials);
  const [activeTab, setActiveTab] = useState<"issue" | "receive" | "wallet">(
    "wallet"
  );

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
          Error loading credentials: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Credentials Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("issue")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "issue"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <SendHorizontal size={20} />
            <span>Issue</span>
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "receive"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Download size={20} />
            <span>Receive</span>
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "wallet"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Wallet size={20} />
            <span>Wallet</span>
          </button>
        </div>
      </div>
      {activeTab === "issue" && (
        <IssueCredentialSection credentials={credentials} />
      )}
      {activeTab === "wallet" && <WalletSection />}
      {activeTab === "receive" && (
        <RequestCredentialSection credentials={credentials} />
      )}
    </div>
  );
};
