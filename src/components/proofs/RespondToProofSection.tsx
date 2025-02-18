import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { presentationExchange } from "../../api/presentationExchange";
import { useWallet } from "../../hooks/useWallet";
import { CheckCircle2, Clock, XCircle, Shield } from "lucide-react";

interface RespondToProofSectionProps {
  proofs: any[];
}

export const RespondToProofSection = ({
  proofs,
}: RespondToProofSectionProps) => {
  const { data: credentials = [] } = useWallet();
  const [selectedCredentials, setSelectedCredentials] = useState<{
    [key: string]: string;
  }>({});
  const queryClient = useQueryClient();
  const [selectedProof, setSelectedProof] = useState<any>(null);

  const presentationMutation = useMutation({
    mutationFn: (presExId: string) => {
      const presentationRequest = {
        requested_attributes: Object.entries(selectedCredentials).reduce(
          (acc, [key, credId]) => ({
            ...acc,
            [key]: {
              cred_id: credId,
              revealed: true,
            },
          }),
          {}
        ),
      };
      return presentationExchange.sendPresentation(
        presExId,
        presentationRequest
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proofs"] });
      setSelectedCredentials({});
    },
  });

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "request-received":
        return <Clock className="text-blue-500" size={20} />;
      case "presentation-sent":
        return <CheckCircle2 className="text-green-500" size={20} />;
      case "abandoned":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Shield className="text-gray-500" size={20} />;
    }
  };

  const receivedProofs = proofs.filter(
    (proof) => proof.role === "prover" && proof.state !== "abandoned"
  );

  const handleCredentialSelect = (
    attributeName: string,
    credentialId: string
  ) => {
    setSelectedCredentials((prev) => ({
      ...prev,
      [attributeName]: credentialId,
    }));
  };

  const getMatchingCredentials = (attributeName: string) => {
    return credentials.filter((cred: any) =>
      Object.keys(cred.attrs).includes(attributeName)
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Received Proof Requests</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receivedProofs.map((proof) => (
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

              {proof.state === "request-received" && (
                <div className="mt-4 space-y-4">
                  <h5 className="font-medium text-sm">Required Attributes:</h5>
                  {Object.keys(
                    proof.presentation_request.requested_attributes
                  ).map((attrKey) => {
                    const attr =
                      proof.presentation_request.requested_attributes[attrKey];
                    const matchingCredentials = getMatchingCredentials(
                      attr.name
                    );

                    return (
                      <div key={attrKey} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {attr.name}
                        </label>
                        <select
                          value={selectedCredentials[attrKey] || ""}
                          onChange={(e) =>
                            handleCredentialSelect(attrKey, e.target.value)
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="">Select credential...</option>
                          {matchingCredentials.map((cred: any) => (
                            <option key={cred.referent} value={cred.referent}>
                              {cred.attrs[attr.name]}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      presentationMutation.mutate(proof.pres_ex_id);
                    }}
                    disabled={
                      presentationMutation.isPending ||
                      Object.keys(
                        proof.presentation_request.requested_attributes
                      ).length !== Object.keys(selectedCredentials).length
                    }
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {presentationMutation.isPending
                      ? "Sending..."
                      : "Send Presentation"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
