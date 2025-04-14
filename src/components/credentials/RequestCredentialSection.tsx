import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { credentialExchange } from "../../api/credentialExchange";
import { useConnections } from "../../hooks/useConnections";
import { Plus, Loader, XCircle } from "lucide-react";
// import { credential } from "@/store/modules/credential/credential";

interface RequestCredentialSectionProps {
  credentials: any[];
}

export const RequestCredentialSection = ({
  credentials,
}: RequestCredentialSectionProps) => {
  const queryClient = useQueryClient();
  const { data: connections = [] } = useConnections();
  const [selectedConnection, setSelectedConnection] = useState("");
  const [attributes, setAttributes] = useState([{ name: "", value: "" }]);
  const [credentialSchema, setCredentialSchema] = useState("");
  const [comment, setComment] = useState("");

  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const getConnectionLabel = (connectionId: string) => {
    const connection = connections.find(
      (conn: any) => conn.connection_id === connectionId
    );
    return connection?.their_label || "No Alias";
  };

  const proposalMutation = useMutation({
    mutationFn: (data: any) =>
      credentialExchange.sendProposal(
        data.connectionId,
        data.proposal,
        data.comment,
        data.filter
      ),
    onError: (error) => {
      console.error("Error sending proposal:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      setAttributes([{ name: "", value: "" }]);
      setSelectedConnection("");
      setCredentialSchema("");
      setComment("");
      setSelectedOffer(null);
      setShowDenyInput(false);
      setDenyReason("");
    },
  });

  const requestMutation = useMutation({
    mutationFn: (credExId: string) => credentialExchange.sendRequest(credExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });

  const credentialStoreMutation = useMutation({
    mutationFn: (credExId: string) =>
      credentialExchange.storeCredential(credExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const [showDenyInput, setShowDenyInput] = useState(false);
  const [denyReason, setDenyReason] = useState("");

  const handleDenyCredential = async (
    credExId: string,
    description: string
  ) => {
    await credentialExchange.problemReport(credExId, description);
  };

  const handleAttributeChange = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  // console.log("attributes", attributes);

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection) return;

    const filteredAttributes = attributes.filter(
      (attr) => attr.name && attr.value
    );
    if (filteredAttributes.length === 0) {
      alert("Please add at least one attribute.");
      return;
    }

    const credentialAttributes = filteredAttributes.map((attr) => ({
      name: attr.name,
      value: attr.value,
    }));

    proposalMutation.mutate({
      connectionId: selectedConnection,
      proposal: credentialAttributes,
      comment: comment,
      filter: {
        indy: {
          schema_id: credentialSchema,
        },
      },
    });
    // Reset form fields
  };

  const handleAcceptCredential = (credExId: string) => {
    credentialStoreMutation.mutate(credExId);
  };

  const handleSendRequest = (credExId: string) => {
    requestMutation.mutate(credExId);
  };

  const receivedOffers = credentials.filter(
    (cred) => cred.cred_ex_record.state === "offer-received"
  );

  const proposedCredentials = credentials.filter(
    (cred) => cred.cred_ex_record.state === "proposal-sent"
  );

  const abandonedCredentials = credentials.filter(
    (cred) =>
      cred.cred_ex_record.state === "abandoned" &&
      cred.cred_ex_record.role === "holder"
  );

  const requestSent = credentials.filter(
    (cred) => cred.cred_ex_record.state === "request-sent"
  );

  const credentialsReceived = credentials.filter(
    (cred) => cred.cred_ex_record.state === "credential-received"
  );

  const handleDelete = (credExId: string) => {
    credentialExchange
      .deleteRecord(credExId)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["credentials"] });
      })
      .catch((error) => {
        console.error("Error deleting credential:", error);
      });
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Request New Credential</h3>
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Connection
            </label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700">
              Credential Schema
            </label>
            <input
              type="text"
              placeholder="Credential Schema"
              value={credentialSchema}
              onChange={(e) => setCredentialSchema(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comment (optional)
            </label>
            <input
              type="text"
              placeholder="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Attributes
            </label>
            {attributes.map((attr, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeChange(index, "name", e.target.value)
                  }
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={attr.value}
                  onChange={(e) =>
                    handleAttributeChange(index, "value", e.target.value)
                  }
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAttribute}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={16} />
              <span>Add Attribute</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={proposalMutation.isPending || !selectedConnection}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {proposalMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin" size={16} />
                <span>Sending Proposal...</span>
              </div>
            ) : (
              "Send Proposal"
            )}
          </button>
        </form>
      </div>

      {/* Received Offers */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Received Offers ({receivedOffers.length})
          <span className="text-gray-500 text-sm">select to view details</span>
        </h3>
        <h3 className="text-lg font-semibold mb-4">
          {selectedOffer && selectedOffer.cred_ex_record.cred_ex_id && (
            <button
              onClick={() => setSelectedOffer(null)}
              className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 ml-4 inline-flex items-center"
            >
              Hide Details <XCircle size={16} className="ml-1" />
            </button>
          )}
        </h3>
        {receivedOffers.length === 0 ? (
          <div className="text-gray-500">No pending credential offers</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {receivedOffers.map((offer) => (
              <div
                key={offer.cred_ex_record.cred_ex_id}
                onClick={() => setSelectedOffer(offer)}
                className={`border rounded-lg p-4 cursor-pointer ${
                  selectedOffer?.cred_ex_record.cred_ex_id ===
                  offer.cred_ex_record.cred_ex_id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50"
                }`}
              >
                <div className="font-semibold mb-2">
                  Credential Offer from {offer.cred_ex_record.connection_id}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>State: {offer.cred_ex_record.state}</p>
                  <p>
                    Created:{" "}
                    {new Date(offer.cred_ex_record.created_at).toLocaleString()}
                  </p>
                </div>
                {/* Show connection label and attributes if selected */}
                {selectedOffer?.cred_ex_record.cred_ex_id ===
                  offer.cred_ex_record.cred_ex_id && (
                  <div className="border-t pt-2 mt-2 text-sm">
                    <p className="font-semibold">
                      Connection Label:{" "}
                      {getConnectionLabel(offer.cred_ex_record.connection_id)}
                    </p>
                    <div className="mt-2 bg-yellow-50 p-2 rounded">
                      <p className="font-medium">Offered Attributes:</p>
                      {offer.cred_ex_record.cred_offer?.credential_preview?.attributes?.map(
                        (attr: any, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between items-center py-1"
                          >
                            <span className="font-medium text-gray-700">
                              {attr.name}:
                            </span>
                            <span className="text-gray-900">{attr.value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() =>
                    handleSendRequest(offer.cred_ex_record.cred_ex_id)
                  }
                  disabled={requestMutation.isPending}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Approve Offer
                </button>
                <div>
                  {showDenyInput ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={denyReason}
                        onChange={(e) => setDenyReason(e.target.value)}
                        placeholder="Reason for denial"
                        className="border rounded p-2 w-full"
                      />
                      <button
                        onClick={() => {
                          handleDenyCredential(
                            offer.cred_ex_record.cred_ex_id,
                            denyReason
                          );
                          setShowDenyInput(false);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Confirm Deny
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDenyInput(true)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Deny
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* credentialsReceived */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Received Credentials ({credentialsReceived.length})
        </h3>
        {credentialsReceived.length === 0 ? (
          <div className="text-gray-500">No received credentials</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {credentialsReceived.map((cred) => (
              <div
                key={cred.cred_ex_record.cred_ex_id}
                className="border rounded-lg p-4"
              >
                <div className="font-semibold mb-2">
                  Credential Offer from {cred.cred_ex_record.connection_id}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>State: {cred.cred_ex_record.state}</p>
                  <p>
                    Created:{" "}
                    {new Date(cred.cred_ex_record.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-medium">Credential Attributes:</p>
                  {cred.cred_ex_record?.cred_offer?.credential_preview?.attributes?.map(
                    (attr: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="font-medium text-gray-700">
                          {attr.name}:
                        </span>
                        <span className="text-gray-900">{attr.value}</span>
                      </div>
                    )
                  )}
                </div>
                <button
                  onClick={() => {
                    handleAcceptCredential(cred.cred_ex_record.cred_ex_id);
                  }}
                  disabled={requestMutation.isPending}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept Credential
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposed Offers */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Proposed Credentials ({proposedCredentials.length})
        </h3>
        {proposedCredentials.length === 0 ? (
          <div className="text-gray-500">No proposed credential offers</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proposedCredentials.map((offer) => (
              <div
                key={offer.cred_ex_record.cred_ex_id}
                className="border rounded-lg p-4"
              >
                <div className="font-semibold mb-2">
                  Credential Offer from {offer.cred_ex_record.connection_id}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>State: {offer.cred_ex_record.state}</p>
                  <p>
                    Created:{" "}
                    {new Date(offer.cred_ex_record.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(offer.cred_ex_record.cred_ex_id)}
                  disabled={requestMutation.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Abandoned Credentials */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Abandoned Credentials ({abandonedCredentials.length})
        </h3>
        {abandonedCredentials.length === 0 ? (
          <div className="text-gray-500">No abandoned credentials</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {abandonedCredentials.map((offer) => (
              <div
                key={offer.cred_ex_record.cred_ex_id}
                className="border rounded-lg p-4"
              >
                <div className="font-semibold mb-2">
                  Credential Offer from {offer.cred_ex_record.connection_id}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>State: {offer.cred_ex_record.state}</p>
                  <p>
                    Created:{" "}
                    {new Date(offer.cred_ex_record.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(offer.cred_ex_record.cred_ex_id)}
                  disabled={requestMutation.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Sent */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Request Sent Credentials ({requestSent.length})
        </h3>
        {requestSent.length === 0 ? (
          <div className="text-gray-500">No request sent credentials</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requestSent.map((offer) => (
              <div
                key={offer.cred_ex_record.cred_ex_id}
                className="border rounded-lg p-4"
              >
                <div className="font-semibold mb-2">
                  Credential Offer from {offer.cred_ex_record.connection_id}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>State: {offer.cred_ex_record.state}</p>
                  <p>
                    Created:{" "}
                    {new Date(offer.cred_ex_record.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
