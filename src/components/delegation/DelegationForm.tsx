import React, { useState } from "react";
import { connections } from "../../api/agent";
import { useMutation } from "@tanstack/react-query";
import { Calendar, Clock, User, Shield } from "lucide-react";

interface DelegationFormProps {
  connections: any[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: "create_account",
    name: "Create Account",
    description: "Ability to create new customer accounts",
  },
  {
    id: "approve_loan",
    name: "Approve Loan",
    description: "Ability to approve loan applications",
  },
  {
    id: "view_transactions",
    name: "View Transactions",
    description: "Ability to view customer transactions",
  },
  {
    id: "issue_cards",
    name: "Issue Cards",
    description: "Ability to issue new cards to customers",
  },
  {
    id: "manage_investments",
    name: "Manage Investments",
    description: "Ability to manage customer investments",
  },
];

export const DelegationForm = ({ connections }: DelegationFormProps) => {
  const [selectedConnection, setSelectedConnection] = useState("");
  const [delegateTo, setDelegateTo] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [nonce] = useState(() => Math.random().toString(36).substring(7));

  const mutation = useMutation({
    mutationFn: async (message: any) => {
      return await connections.sendBasicMessage(
        selectedConnection,
        JSON.stringify(message)
      );
    },
  });

  const generateDelegationProof = async () => {
    const data = `${delegateTo}${selectedPermissions.join(",")}${nonce}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const delegationProof = await generateDelegationProof();
    const delegationMessage = {
      type: "delegation_request",
      delegate_to: delegateTo,
      permissions: selectedPermissions,
      delegation_proof: delegationProof,
      valid_from: validFrom,
      valid_to: validTo,
      nonce: nonce,
    };

    mutation.mutate(delegationMessage);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Issuer Connection
          </label>
          <select
            value={selectedConnection}
            onChange={(e) => setSelectedConnection(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select a connection...</option>
            {connections.map((conn: any) => (
              <option key={conn.connection_id} value={conn.connection_id}>
                {conn.their_label || conn.connection_id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span>Delegate To (Employee Number)</span>
            </div>
          </label>
          <input
            type="text"
            value={delegateTo}
            onChange={(e) => setDelegateTo(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
            placeholder="Enter employee number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Shield size={16} />
              <span>Permissions to Delegate</span>
            </div>
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-md">
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <div key={permission.id} className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPermissions([
                        ...selectedPermissions,
                        permission.id,
                      ]);
                    } else {
                      setSelectedPermissions(
                        selectedPermissions.filter((id) => id !== permission.id)
                      );
                    }
                  }}
                  className="mt-1"
                />
                <label htmlFor={permission.id} className="flex-1">
                  <div className="font-medium">{permission.name}</div>
                  <div className="text-sm text-gray-600">
                    {permission.description}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Valid From</span>
              </div>
            </label>
            <input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>Valid To</span>
              </div>
            </label>
            <input
              type="datetime-local"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={
            mutation.isPending ||
            !selectedConnection ||
            selectedPermissions.length === 0
          }
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {mutation.isPending
            ? "Sending Delegation Request..."
            : "Send Delegation Request"}
        </button>

        {mutation.isSuccess && (
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-green-800">
              Delegation request sent successfully!
            </p>
          </div>
        )}

        {mutation.isError && (
          <div className="p-4 bg-red-50 rounded-md">
            <p className="text-red-800">
              Error sending delegation request. Please try again.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
