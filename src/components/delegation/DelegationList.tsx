import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Node_Server_URL } from "../../config/constants";
import {
  Calendar,
  Clock,
  User,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface DelegationRequest {
  id: string;
  type: string;
  delegate_to: string;
  permissions: string[];
  delegation_proof: string;
  valid_from: string;
  valid_to: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const DelegationList = () => {
  const {
    data: delegations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["delegations"],
    queryFn: async () => {
      const response = await axios.get(`${Node_Server_URL}/delegations`);
      return response.data as DelegationRequest[];
    },
  });

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
          Error loading delegation history: {(error as Error).message}
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Delegation History</h3>
        {delegations.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No delegation requests found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {delegations.map((delegation) => (
              <div
                key={delegation.id}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      Delegation Request
                    </h4>
                    <p
                      className={`text-sm ${getStatusColor(delegation.status)}`}
                    >
                      {delegation.status.charAt(0).toUpperCase() +
                        delegation.status.slice(1)}
                    </p>
                  </div>
                  {getStatusIcon(delegation.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      Delegated to: {delegation.delegate_to}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Shield size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      Permissions: {delegation.permissions.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      Valid:{" "}
                      {new Date(delegation.valid_from).toLocaleDateString()} -{" "}
                      {new Date(delegation.valid_to).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(delegation.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
