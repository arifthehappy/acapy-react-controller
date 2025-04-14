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
  const [selectedProofCredentials, setSelectedProofCredentials] = useState<{
    [proofId: string]: {
      attributes: { [attrkey: string]: string };
      predicates: { [predkey: string]: string };
    };
  }>({}); // { proofId: { attributes: { attrKey: credId }, predicates: { predKey: credId } } }

  const [selectedProof, setSelectedProof] = useState<any>(null);

  const [selectedAttributeCredentials, setSelectedAttributeCredentials] =
    useState<{
      [key: string]: string;
    }>({});
  const [selectedPredicateCredentials, setSelectedPredicateCredentials] =
    useState<{
      [key: string]: string;
    }>({});

  const queryClient = useQueryClient();

  const presentationMutation = useMutation({
    mutationFn: (presExId: string) => {
      // Get credential specific to the proof
      const proofCredentials = selectedProofCredentials[presExId] || {
        attributes: {},
        predicates: {},
      };

      const presentationRequest = {
        requested_attributes: Object.entries(
          proofCredentials.attributes
        ).reduce(
          (acc, [key, credId]) => ({
            ...acc,
            [key]: {
              cred_id: credId,
              revealed: true,
            },
          }),
          {}
        ),
        requested_predicates: Object.entries(
          proofCredentials.predicates
        ).reduce(
          (acc, [key, credId]) => ({
            ...acc,
            [key]: {
              cred_id: credId,
            },
          }),
          {}
        ),
        self_attested_attributes: {},
      };
      console.log("presentationRequest", presentationRequest);
      return presentationExchange.sendPresentation(
        presExId,
        presentationRequest
      );
    },
    onSuccess: (data, presExId) => {
      queryClient.invalidateQueries({ queryKey: ["proofs"] });
      setSelectedProofCredentials((prev) => {
        const updated = { ...prev };
        delete updated[presExId];
        return updated;
      });
      setSelectedProof(null);
    },
  });

  const handleSendPresentation = (presExId: string) => {
    presentationMutation.mutate(presExId);
  };

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

  const handleAttributeCredentialSelect = (
    proofId: string,
    attrKey: string,
    credentialId: string
  ) => {
    setSelectedProofCredentials((prev) => ({
      ...prev,
      [proofId]: {
        attributes: {
          ...(prev[proofId]?.attributes || {}),
          [attrKey]: credentialId,
        },
        predicates: prev[proofId]?.predicates || {},
      },
    }));
  };

  const handlePredicateCredentialSelect = (
    proofId: string,
    predkey: string,
    credentialId: string
  ) => {
    setSelectedProofCredentials((prev) => ({
      ...prev,
      [proofId]: {
        attributes: prev[proofId]?.attributes || {},
        predicates: {
          ...(prev[proofId]?.predicates || {}),
          [predkey]: credentialId,
        },
      },
    }));
  };

  // console.log(credentials, "credentials");

  const handleDeleteProof = async (presExId: string) => {
    try {
      await presentationExchange.deleteRecord(presExId);
      queryClient.invalidateQueries({ queryKey: ["proofs"] });
    } catch (error) {
      console.error("Error deleting proof:", error);
    }
  };

  const getMatchingCredentials = (attributeName: string) => {
    return credentials.filter((cred: any) =>
      Object.keys(cred.attrs).includes(attributeName)
    );
  };

  console.log("proof", proofs);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Received Proof Requests
          <p
            onClick={() => setSelectedProof(null)}
            className="text-sm text-gray-600 cursor-pointer float-right "
          >
            clear (X){" "}
          </p>
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receivedProofs.map((proof) => {
            const proofId = proof.pres_ex_id;
            const proofCredentials = selectedProofCredentials[proofId] || {
              attributes: {},
              predicates: {},
            };
            return (
              <div
                key={proofId}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProof?.pres_ex_id === proof.pres_ex_id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                onClick={() => setSelectedProof(proof)}
              >
                {/* proof details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">Proof Request</h4>
                    <p className="text-sm text-gray-600">
                      State: {proof.state}
                    </p>
                  </div>
                  {getStatusIcon(proof.state)}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>ID: {proof.pres_ex_id}</p>
                  <p>
                    Presentation Name: {proof.by_format.pres_request.indy.name}
                  </p>
                  <p>Connection: {proof.connection_id}</p>
                  <p>Created: {new Date(proof.created_at).toLocaleString()}</p>
                </div>

                {proof.state === "request-received" && (
                  // Requested Attributes
                  <div className="mt-4 space-y-4">
                    <h5 className="font-medium text-sm">
                      Required Attributes:
                    </h5>
                    {Object.keys(
                      proof?.by_format?.pres_request?.indy?.requested_attributes
                    ).map((attrKey) => {
                      const attr =
                        proof.by_format.pres_request.indy.requested_attributes[
                          attrKey
                        ];
                      const matchingCredentials = getMatchingCredentials(
                        attr.name
                      );

                      return (
                        <div key={attrKey} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {attr.name}
                          </label>
                          <select
                            value={proofCredentials.attributes[attrKey] || ""}
                            onChange={(e) =>
                              handleAttributeCredentialSelect(
                                proofId,
                                attrKey,
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Select credential...</option>
                            {matchingCredentials.map((cred: any) => (
                              <option key={cred.referent} value={cred.referent}>
                                {cred.attrs[attr.name]} ({cred.referent})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}

                    <h5>Requested Predicates</h5>
                    {Object.keys(
                      proof?.by_format?.pres_request?.indy?.requested_predicates
                    ).map((predicateKey) => {
                      const predicate =
                        proof.by_format.pres_request.indy.requested_predicates[
                          predicateKey
                        ];
                      return (
                        <div key={predicateKey} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {predicate.name}
                          </label>
                          <select
                            value={
                              proofCredentials.predicates[predicateKey] || ""
                            }
                            required
                            onChange={(e) =>
                              handlePredicateCredentialSelect(
                                proofId,
                                predicateKey,
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Select credential...</option>
                            {credentials.map((cred: any) => (
                              <option key={cred.referent} value={cred.referent}>
                                {cred.attrs[predicate.name]} ({cred.referent})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}

                    <button
                      onClick={(e) => {
                        handleSendPresentation(proofId);
                        console.log("send presentation", proofId);
                      }}
                      disabled={
                        presentationMutation.isPending ||
                        // Check if any required attribute lacks a credential
                        Object.keys(
                          proof.by_format.pres_request.indy.requested_attributes
                        ).some(
                          (attrKey) =>
                            !proofCredentials.attributes[attrKey] ||
                            !proofCredentials.attributes[attrKey].length
                        ) ||
                        // Check if any required predicate lacks a credential
                        Object.keys(
                          proof.by_format.pres_request.indy.requested_predicates
                        ).some(
                          (predKey) =>
                            !proofCredentials.predicates[predKey] ||
                            !proofCredentials.predicates[predKey].length
                        )
                      }
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      {presentationMutation.isPending
                        ? "Sending..."
                        : "Send Presentation"}
                    </button>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProof(proof.pres_ex_id);
                  }}
                  className="mt-2 bg-red-300 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete Proof
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
