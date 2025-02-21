import React, { useState } from "react";
import { useConnections } from "../../hooks/useConnections";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { presentationExchange } from "../../api/presentationExchange";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  SwitchCamera,
} from "lucide-react";
import { schemas } from "../../api/agent";
import { useWallet } from "../../hooks/useWallet";

interface RequestProofSectionProps {
  proofs: any[];
}

interface Predicate {
  name: string;
  p_type: string;
  p_value: number;
  //   restrictions: [];
}

export const RequestProofSection = ({ proofs }: RequestProofSectionProps) => {
  const { data: connections = [] } = useConnections();
  const [selectedConnection, setSelectedConnection] = useState("");
  const [comment, setComment] = useState("");
  const [selectedSchemaId, setSelectedSchemaId] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);
  const [version, setVersion] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [presentationName, setPresentationName] = useState("");
  const [selectedPredicates, setSelectedPredicates] = useState<Predicate[]>([]);

  const requestMutation = useMutation({
    mutationFn: () =>
      Promise.resolve(
        presentationExchange.sendRequest(selectedConnection, comment, {
          name: presentationName,
          version: version,
          nonce: (Math.floor(Math.random() * 990) + 10).toString(),
          requested_attributes: selectedAttributes.reduce(
            (acc, attr, index) => {
              acc[`additionalProp${index + 1}`] = {
                name: attr,
                // restrictions: [],
              };
              return acc;
            },
            {} as any
          ),
          requested_predicates: selectedPredicates.reduce(
            (acc, pred, index) => {
              acc[`additionalProp${index + 1}`] = {
                name: pred.name,
                p_type: pred.p_type,
                p_value: Number(pred.p_value),
                // restrictions: [],
              };
              console.log("acc:", acc);
              return acc;
            },
            {} as any
          ),
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proofs"] });
      setSelectedConnection("");
      setSelectedAttributes([]);
      setSelectedPredicates([]);
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

  const handleAddPredicate = () => {
    setSelectedPredicates([
      ...selectedPredicates,
      { name: "", p_type: "", p_value: 0 },
    ]);
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...selectedAttributes];
    newAttributes[index] = value;
    setSelectedAttributes(newAttributes);
  };

  const handlePredicateChange = (
    index: number,
    field: keyof Predicate,
    value: string | number
  ) => {
    const newPredicates = [...selectedPredicates];
    newPredicates[index] = { ...newPredicates[index], [field]: value };
    setSelectedPredicates(newPredicates);
  };

  const handleRemoveAttribute = (index: number) => {
    setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
  };

  const handleRemovePredicate = (index: number) => {
    setSelectedPredicates(selectedPredicates.filter((_, i) => i !== index));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("selectedAttributes:", selectedAttributes);
    requestMutation.mutate();
  };

  const { data: schemasData, isLoading: schemasLoading } = useQuery({
    queryKey: ["schemas"],
    queryFn: () => schemas.getCreated(),
  });

  const handleFetchAttributes = async () => {
    const schema = await schemas.getById(selectedSchemaId);
    console.log("schema:", schema);
    // set selected attributes if schema is found
    if (schema) {
      setSelectedAttributes(Object.values(schema.data.schema.attrNames));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Request New Proof</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* schema */}

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Schema ID
              </label>
              <button
                type="button"
                onClick={() => setIsManualInput(!isManualInput)}
                className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                <SwitchCamera size={16} />
                <span>
                  {isManualInput ? "Select from list" : "Enter manually"}
                </span>
              </button>
            </div>

            {isManualInput ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={selectedSchemaId}
                  onChange={(e) => setSelectedSchemaId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter schema ID..."
                  required
                />
                {/* fetch and apply attributes */}
                <button
                  type="button"
                  disabled={schemasLoading || !selectedSchemaId}
                  className="bg-indigo-600 text-white  px-2 py-1 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  onClick={handleFetchAttributes}
                >
                  <span>Fetch_Attributes</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSchemaId}
                  onChange={(e) => setSelectedSchemaId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a schema...</option>
                  {schemasData?.data.schema_ids?.map((schemaId: string) => (
                    <option key={schemaId} value={schemaId}>
                      {schemaId}
                    </option>
                  ))}
                </select>
                {/* fetch and apply attributes */}
                <button
                  type="button"
                  disabled={schemasLoading || !selectedSchemaId}
                  className="bg-indigo-600 text-white  px-2 py-1 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  onClick={handleFetchAttributes}
                >
                  <span>Fetch Attributes</span>
                </button>
              </div>
            )}
          </div>

          {/* Connection */}
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

          {/* presentation Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Presentation Name
            </label>
            <input
              type="text"
              placeholder="Presentation Name"
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Reason for proof request */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comment for Proof Request
            </label>
            <input
              type="text"
              placeholder="Reason for proof request"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Presentation Request version */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Presentation Request Version
            </label>
            <input
              type="text"
              placeholder="Presentation Request Version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Requested Attributes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Requested Attributes
            </label>
            {selectedAttributes.map((attr, index) => (
              <div key={index} className="flex space-x-2 ">
                <input
                  type="text"
                  value={attr}
                  onChange={(e) => handleAttributeChange(index, e.target.value)}
                  placeholder="Attribute name"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 hover:bg-gray-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-gray-100"
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

          {/* Requested Predicates */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Requested Predicates
            </label>
            {selectedPredicates.map((predicate, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={predicate.name}
                  onChange={(e) =>
                    handlePredicateChange(index, "name", e.target.value)
                  }
                  placeholder="Predicate name"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <select
                  value={predicate.p_type}
                  onChange={(e) =>
                    handlePredicateChange(index, "p_type", e.target.value)
                  }
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Predicate Type</option>
                  <option value=">">{">"}</option>
                  <option value="<">{"<"}</option>
                  <option value="=">{"="}</option>
                  <option value=">=">{">="}</option>
                </select>
                <input
                  type="number"
                  value={predicate.p_value}
                  onChange={(e) =>
                    handlePredicateChange(index, "p_value", e.target.value)
                  }
                  placeholder="Predicate value"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => handleRemovePredicate(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPredicate}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Add Predicate
            </button>
          </div>

          {/* Submit */}
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
        <h3 className="text-lg font-semibold">Sent Proof Requests</h3>
        <button
          type="button"
          onClick={() => setSelectedProof(null)}
          className="text-indigo-600 hover:text-indigo-800 mb-4"
        >
          Clear Selection
        </button>
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

      {selectedProof && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Selected Proof Request</h3>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(selectedProof, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
