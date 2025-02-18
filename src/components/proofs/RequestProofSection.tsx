import React, { useState } from "react";
import { useConnections } from "../../hooks/useConnections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { presentationExchange } from "../../api/presentationExchange";
import { CheckCircle2, Clock, XCircle, Shield } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";

interface RequestProofSectionProps {
  proofs: any[];
}

export const RequestProofSection = ({ proofs }: RequestProofSectionProps) => {
  const { data: connections = [] } = useConnections();
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [selectedProof, setSelectedProof] = useState<any>(null);

  const requestMutation = useMutation({
    mutationFn: () =>
      presentationExchange.sendRequest(selectedConnection, {
        name: "Proof Request",
        version: "1.0",
        requested_attributes: selectedAttributes.reduce((acc, attr) => {
          acc[attr] = {
            name: attr,
            restrictions: [],
          };
          return acc;
        }, {} as any),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proofs"] });
      setSelectedConnection("");
      setSelectedAttributes([]);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (presExId: string) =>
      presentationExchange.verifyPresentation(presExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proofs"] });
    },
  });

  const handleAddAttribute = () => {
    setSelectedAttributes([...selectedAttributes, ""]);
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...selectedAttributes];
    newAttributes[index] = value;
    setSelectedAttributes(newAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "presentation-received":
        return <CheckCircle2 className="text-green-500" size={20} />;
      case "request-sent":
        return <Clock className="text-blue-500" size={20} />;
      case "abandoned":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Shield className="text-gray-500" size={20} />;
    }
  };

  const sentProofs = proofs.filter(
    (proof) => proof.role === "verifier" && proof.state !== "abandoned"
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Request New Proof</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Connection
            </label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Requested Attributes
            </label>
            {selectedAttributes.map((attr, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={attr}
                  onChange={(e) => handleAttributeChange(index, e.target.value)}
                  placeholder="Attribute name"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAttribute}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Add Attribute
            </button>
          </div>

          <button
            type="submit"
            disabled={
              requestMutation.isPending ||
              !selectedConnection ||
              selectedAttributes.length === 0
            }
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {requestMutation.isPending
              ? "Sending Request..."
              : "Send Proof Request"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Sent Proof Requests</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sentProofs.map((proof) => (
            <div
              key={proof.pres_ex_id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedProof?.pres_ex_id === proof.pres_ex_id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
              onClick={() => setSelectedProof(proof)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Proof Request</h4>
                  <p className="text-sm text-gray-600">State: {proof.state}</p>
                </div>
                {getStatusIcon(proof.state)}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Connection: {proof.connection_id}</p>
                <p>Created: {new Date(proof.created_at).toLocaleString()}</p>
              </div>
              {proof.state === "presentation-received" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    verifyMutation.mutate(proof.pres_ex_id);
                  }}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending
                    ? "Verifying..."
                    : "Verify Presentation"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
