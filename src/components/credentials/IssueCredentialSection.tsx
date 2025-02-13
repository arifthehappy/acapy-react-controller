import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { connections, schemas, credentialDefinitions } from "../../api/agent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { credentialExchange } from "../../api/credentialExchange";
import { CredentialCard } from "./CredentialCard";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useConnections } from "../../hooks/useConnections";
import { credential } from "@/store/modules/credential/credential";

interface IssueCredentialSectionProps {
  credentials: any[];
}

export const IssueCredentialSection = ({
  credentials,
}: IssueCredentialSectionProps) => {
  const queryClient = useQueryClient();

  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [schemaAttributes, setSchemaAttributes] = useState<{
    [key: string]: string;
  }>({});
  const [selectedCredDefId, setSelectedCredDefId] = useState("");
  const [availableCredDefIds, setAvailableCredDefIds] = useState<string[]>([]);

  const {
    data: definitionQuery,
    isLoadingDefinitions,
    errorDefinitions,
  } = useQuery({
    queryKey: ["credentialDefinitions"],
    queryFn: () => credentialDefinitions.getCreated(),
  });

  useEffect(() => {
    if (definitionQuery) {
      const credDefIds = definitionQuery.data.credential_definition_ids.map(
        (def_id: any) => def_id
      );
      setAvailableCredDefIds(credDefIds);
    }
  }, [definitionQuery]);

  const issueCredentialMutation = useMutation({
    mutationFn: (credExId: string) =>
      credentialExchange.issueCredential(credExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });

  const fetchSchemaAttributes = async (schemaId: string) => {
    const schema = await schemas.getById(schemaId);
    return schema;
  };

  const schemaAttributesQuery = useQuery({
    queryKey: [
      "schemaAttributes",
      selectedCredential?.cred_ex_record?.by_format?.cred_proposal?.indy
        ?.schema_id,
    ],
    queryFn: () =>
      fetchSchemaAttributes(
        selectedCredential?.cred_ex_record?.by_format?.cred_proposal?.indy
          ?.schema_id
      ),
    enabled:
      !!selectedCredential?.cred_ex_record?.by_format?.cred_proposal?.indy
        ?.schema_id,
  });

  useEffect(() => {
    if (selectedCredential) {
      const initialAttributes: { [key: string]: string } = {};
      schemaAttributesQuery.data?.data?.schema?.attrNames?.forEach(
        (attrName: string) => {
          const existingValue =
            selectedCredential.cred_ex_record.cred_proposal?.credential_preview?.attributes?.find(
              (attr: any) => attr.name === attrName
            )?.value || "";
          initialAttributes[attrName] = existingValue;
        }
      );
      setSchemaAttributes(initialAttributes);
    }
  }, [selectedCredential, schemaAttributesQuery.data]);

  const filter = {
    indy: {
      cred_def_id: selectedCredDefId,
      // issuer_did: selectedCredential?.cred_ex_record?.by_format?.cred_proposal?.indy?.issuer_did,
      schema_id: schemaAttributesQuery?.data?.data?.schema?.id,
      // schema_issuer_did: selectedCredential?.cred_ex_record?.by_format?.cred_proposal?.indy?.schema_issuer_did,
      schema_name: schemaAttributesQuery?.data?.data?.schema?.name,
      schema_version: schemaAttributesQuery?.data?.data?.schema?.version,
    },
  };

  // console.log(filter, "filter");

  const sendOfferMutation = useMutation({
    mutationFn: (credExId: string) =>
      credentialExchange.sendOffer(
        credExId,
        Object.entries(schemaAttributes).map(([key, value]) => ({
          name: key,
          value: value,
        })),
        filter
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });

  // console.log(
  //   Object.entries(schemaAttributes).map(([key, value]) => ({
  //     name: key,
  //     value: value,
  //   })),
  //   "schemaAttributes"
  // );

  const handleIssue = (credExId: string) => {
    issueCredentialMutation.mutate(credExId);
  };

  const handleSendOffer = (credExId: string) => {
    // check if all required attributes are filled
    const allAttributesFilled = Object.values(schemaAttributes).every(
      (attr) => attr
    );
    if (!allAttributesFilled) {
      alert("Please fill all attributes");
      return;
    }
    // check if cred def id is selected
    if (!selectedCredDefId) {
      alert("Please select a credential definition ID");
      return;
    }
    try {
      sendOfferMutation.mutate(credExId);
    } catch (error) {
      console.error(error, "error sending offer");
    }
  };

  const handleDelete = (credExId: string) => {
    credentialExchange.deleteRecord(credExId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    });
  };

  const handleAttributeChange = (attrName: string, value: string) => {
    setSchemaAttributes({
      ...schemaAttributes,
      [attrName]: value,
    });
  };

  const issuableCredentials = credentials.filter(
    (cred) =>
      cred.cred_ex_record.state === "proposal-received" ||
      cred.cred_ex_record.state === "request-received" ||
      (cred.cred_ex_record.state === "abandoned" &&
        cred.cred_ex_record.role === "issuer")
  );

  const credentialsIssued = credentials.filter(
    (cred) => cred.cred_ex_record.state === "credential-issued"
  );

  const offerSent = credentials.filter(
    (cred) => cred.cred_ex_record.state === "offer-sent"
  );

  const {
    data: connectionsData = [],
    isLoadingConnection,
    errorConnection,
  } = useConnections();

  const getConnectionLabel = (connectionId: string) => {
    const connection = connectionsData?.find(
      (conn: any) => conn.connection_id === connectionId
    );
    return connection?.their_label || "No Alias";
  };

  const connectionLabel = selectedCredential
    ? getConnectionLabel(selectedCredential.cred_ex_record.connection_id)
    : "";

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
        <h3 className="text-lg font-semibold mb-4">
          {selectedCredential &&
            selectedCredential.cred_ex_record.cred_ex_id && (
              <button
                onClick={() => setSelectedCredential(null)}
                className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 ml-4 inline-flex items-center"
              >
                Hide Details <XCircle size={16} className="ml-1" />
              </button>
            )}
        </h3>
        {issuableCredentials.length === 0 ? (
          <div className="text-gray-500">No pending credential requests</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3     ">
            {issuableCredentials.map((credential) => (
              <div
                key={credential.cred_ex_record.cred_ex_id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out hover:bg-indigo-50 h-auto ${
                  selectedCredential?.cred_ex_record.cred_ex_id ===
                  credential.cred_ex_record.cred_ex_id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                onClick={() => setSelectedCredential(credential)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {credential.cred_ex_record.cred_proposal?.credential_preview
                      ?.attributes?.[0]?.value || "Unnamed Credential"}
                  </span>
                  {credential.cred_ex_record.state === "proposal-received" && (
                    <Clock className="text-blue-500" size={20} />
                  )}
                  {credential.cred_ex_record.state === "request-received" && (
                    <CheckCircle2 className="text-green-500" size={20} />
                  )}
                  {credential.cred_ex_record.state === "abandoned" && (
                    <XCircle className="text-red-500" size={20} />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {connectionLabel && <p>Connection: {connectionLabel}</p>}
                  <p className="font-semibold">
                    Request Comment:{" "}
                    {credential.cred_ex_record.cred_proposal?.comment}
                  </p>
                  <p className="font-semibold">
                    State: {credential.cred_ex_record.state}
                  </p>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    {credential.cred_ex_record.cred_proposal?.credential_preview?.attributes?.map(
                      (attr: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="font-medium text-gray-700">
                            {attr.name}:
                          </span>
                          <span className="text-gray-900">{attr.value}</span>
                        </div>
                      )
                    )}

                    {selectedCredential &&
                      credential.cred_ex_record.state === "proposal-received" &&
                      selectedCredential.cred_ex_record.cred_ex_id ===
                        credential.cred_ex_record.cred_ex_id && (
                        <div className="mt-4 bg-yellow-50 p-2 rounded">
                          {schemaAttributesQuery.isLoading ? (
                            <div>Loading schema attributes...</div>
                          ) : schemaAttributesQuery.isError ? (
                            <div>Error loading schema attributes</div>
                          ) : (
                            Object.keys(schemaAttributes).map(
                              (attrName: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center py-1"
                                >
                                  <span className="font-medium text-gray-700">
                                    {attrName}:
                                  </span>
                                  <input
                                    type="text"
                                    className="border rounded px-2 py-1 text-gray-900 w-1/2 bg-white focus:outline-none focus:border-blue-300"
                                    value={schemaAttributes[attrName]}
                                    onChange={(e) =>
                                      handleAttributeChange(
                                        attrName,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )
                            )
                          )}
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Credential Definition ID
                            </label>
                            <select
                              value={selectedCredDefId}
                              onChange={(e) =>
                                setSelectedCredDefId(e.target.value)
                              }
                              className="border rounded px-2 py-1 w-full"
                            >
                              <option value="">Select Cred Def ID</option>
                              {availableCredDefIds.map((defId) => (
                                <option key={defId} value={defId}>
                                  {defId}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                  </div>

                  <p>
                    Updated:{" "}
                    {new Date(
                      credential.cred_ex_record.updated_at
                    ).toLocaleString()}
                  </p>
                  <p>
                    Connection ID: {credential.cred_ex_record.connection_id}
                  </p>
                </div>
                <div className="mt-4 space-x-2">
                  {credential.cred_ex_record.state === "proposal-received" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendOffer(credential.cred_ex_record.cred_ex_id);
                        // alert("Send Offer");
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer disabled:opacity-50"
                      disabled={
                        selectedCredential?.cred_ex_record.cred_ex_id !==
                        credential.cred_ex_record.cred_ex_id
                      }
                    >
                      Send Offer
                    </button>
                  )}
                  {credential.cred_ex_record.state === "request-received" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIssue(credential.cred_ex_record.cred_ex_id);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Issue
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(credential.cred_ex_record.cred_ex_id);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* credential issued */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Credential Issued</h2>
        {credentialsIssued.length === 0 ? (
          <div className="text-gray-500">No credentials issued</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {credentialsIssued?.map((credential: any) => (
              <div
                key={credential.cred_ex_record.cred_ex_id}
                onClick={() => setSelectedCredential(credential)}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-indigo-50"
              >
                <h3 className="text-lg font-semibold mb-4">
                  {credential.cred_ex_record.cred_ex_id}
                </h3>
                <p>
                  Created:{" "}
                  {new Date(
                    credential.cred_ex_record.created_at
                  ).toLocaleString()}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(
                    credential.cred_ex_record.updated_at
                  ).toLocaleString()}
                </p>
                <p>Connection ID: {credential.cred_ex_record.connection_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer Sent */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Offer Sent</h2>
        {offerSent.length === 0 ? (
          <div className="text-gray-500">No offers sent</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offerSent?.map((credential: any) => (
              <div
                key={credential.cred_ex_record.cred_ex_id}
                onClick={() => setSelectedCredential(credential)}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-indigo-50 hover:border-indigo-500"
              >
                <h3 className="text-lg font-semibold mb-4">
                  {credential.cred_ex_record.cred_ex_id}
                </h3>
                <p>
                  Created:{" "}
                  {new Date(
                    credential.cred_ex_record.created_at
                  ).toLocaleString()}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(
                    credential.cred_ex_record.updated_at
                  ).toLocaleString()}
                </p>
                <p>Connection ID: {credential.cred_ex_record.connection_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCredential && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Selected Credential Details{" "}
            <button
              onClick={() => setSelectedCredential(null)}
              className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block flex items-center"
            >
              Hide Details <XCircle size={16} />
            </button>
          </h3>

          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(selectedCredential, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
