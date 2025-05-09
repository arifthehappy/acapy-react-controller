import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { schemas, credentialDefinitions, wallet } from "../../api/agent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { credentialExchange } from "../../api/credentialExchange";
// import { CredentialCard } from "./CredentialCard";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useConnections } from "../../hooks/useConnections";
import { ROUTES, PERMISSIONS } from "../../config/constants";

interface IssueCredentialSectionProps {
  credentials: any[];
}

export const IssueCredentialSection = ({
  credentials,
}: IssueCredentialSectionProps) => {
  const queryClient = useQueryClient();

  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [schemaAttributes, setSchemaAttributes] = useState<{
    [key: string]: string;
  }>({});
  const [selectedCredDefId, setSelectedCredDefId] = useState("");
  const [availableCredDefIds, setAvailableCredDefIds] = useState<string[]>([]);
  const [availableCredDefIdsSend, setAvailableCredDefIdsSend] = useState<
    string[]
  >([]);

  const [selectedConnectionIdSend, setSelectedConnectionIdSend] = useState("");
  const [attributesSend, setAttributesSend] = useState([
    { name: "", value: "" },
  ]);
  const [commentSend, setCommentSend] = useState("");
  const [selectedCredDefIdSend, setSelectedCredDefIdSend] = useState("");

  const [publicDid, setPublicDid] = useState("");

  const handleAddAttributeSend = () => {
    setAttributesSend([...attributesSend, { name: "", value: "" }]);
  };

  const handleAttributeChangeSend = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const newAttributes = [...attributesSend];
    // if (field === "name" && value === "delegation_id") {
    //   // Always set a new UUID when delegation_id is selected
    //   const uuid =
    //     typeof crypto !== "undefined" && crypto.randomUUID
    //       ? crypto.randomUUID()
    //       : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    //   newAttributes[index] = { name: value, value: uuid };
    // } else {
    // newAttributes[index][field] = value;
    // }
    newAttributes[index][field] = value;
    setAttributesSend(newAttributes);
  };

  console.log("attributesSend", attributesSend);

  const handleRemoveAttributeSend = (index: number) => {
    const newAttributes = attributesSend.filter((_, i) => i !== index);
    setAttributesSend(newAttributes);
  };

  const handleSendCredential = () => {
    const payload = {
      connection_id: selectedConnectionIdSend,
      commentSend,
      credential_preview: {
        "@type": "issue-credential/2.0/credential-preview",
        attributes: attributesSend.map(({ name, value }) => ({
          name,
          value,
        })),
      },
      filter: {
        indy: {
          cred_def_id: selectedCredDefIdSend,
        },
      },
    };

    credentialExchange
      .sendCredential(payload)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["credentials"] });
        alert("Credential sent successfully!");
        setSelectedConnectionIdSend("");
        setSelectedCredDefIdSend("");
        // setAttributesSend([{ name: "", value: "" }]);
        setCommentSend("");
      })
      .catch((error) => {
        console.error("Error sending credential:", error);
        alert("Failed to send credential.");
      });
  };

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
      setAvailableCredDefIdsSend(credDefIds);
    }
  }, [definitionQuery]);

  const issueCredentialMutation = useMutation({
    mutationFn: (credExId: string) =>
      credentialExchange.issueCredential(credExId),
    onError: (error) => {
      console.error("Error issuing credential:", error);
    },
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

  const sendOfferMutation = useMutation({
    mutationFn: (data: any) =>
      credentialExchange.sendOffer(data.credExId, data.attributes, data.filter),
    onError: (error) => {
      console.error("Error sending offer:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });

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

    const attributes = Object.entries(schemaAttributes).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    try {
      sendOfferMutation.mutate({
        credExId,
        attributes: attributes,
        filter: {
          indy: {
            cred_def_id: selectedCredDefId,
            schema_id: schemaAttributesQuery?.data?.data?.schema?.id,
            schema_name: schemaAttributesQuery?.data?.data?.schema?.name,
            schema_version: schemaAttributesQuery?.data?.data?.schema?.version,
          },
        },
      });
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

  // Fetch attributes from credential definition
  const handleFetchAttributesFromCredDef = async () => {
    if (!selectedCredDefIdSend) {
      alert("Please enter or select a Credential Definition ID first.");
      return;
    }
    try {
      // Get the credential definition to extract schema_id
      const credDef = await credentialDefinitions.getById(
        selectedCredDefIdSend
      );

      // console.log("Credential Definition:", credDef);
      if (!credDef || !credDef.data) {
        alert("Could not find the credential definition.");
        return;
      }

      const attributes =
        credDef?.data?.credential_definition?.value?.primary?.r;
      // console.log("Attributes:", attributes);

      // filter out master_secret from attributes
      const filteredAttributes = Object.entries(attributes).reduce(
        (acc: any, [key, value]: any) => {
          if (key !== "master_secret") {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      // add attributes to the state
      // const attr = Object.keys(filteredAttributes).map((key) => ({
      //   name: key,
      //   value: "",
      // }));

      const attr = Object.keys(filteredAttributes).map((key) => ({
        name: key,
        value:
          key === "delegation_id"
            ? typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
            : "",
      }));

      setAttributesSend(attr);
    } catch (error) {
      alert("Failed to fetch schema attributes.");
      console.error(error);
    }
  };

  //fetch public did
  const getPublicDid = async () => {
    const publicDid = await wallet.getPublicDid();
    return publicDid;
  };

  const publicDidQuery = useQuery({
    queryKey: ["publicDid"],
    queryFn: getPublicDid,
  });

  useEffect(() => {
    if (publicDidQuery.data) {
      // console.log("Public DID:", publicDid);
      setPublicDid(publicDidQuery.data?.data.result.did);
    }
  }, [publicDidQuery.data]);

  const Routes = ROUTES;
  const Permissions = PERMISSIONS;

  // Helper to parse and stringify permission_map
  const parsePermissionMap = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      // fallback for legacy format: all_employees:read;loans:read,write
      const obj: any = {};
      str.split(";").forEach((entry) => {
        const [route, perms] = entry.split(":");
        if (route && perms)
          obj[route.trim()] = perms.split(",").map((p) => p.trim());
      });
      return obj;
    }
  };

  const stringifyPermissionMap = (obj: any) => JSON.stringify(obj);

  async function generateDelegationProof(
    delegation_id: string,
    employee_number: string,
    permission_map: string,
    secret_key: string
  ) {
    const data = `${delegation_id}${employee_number}${permission_map}${secret_key}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  useEffect(() => {
    // Extract dependencies into variables
    const delegationIdValue = attributesSend.find(
      (a) => a.name === "delegation_id"
    )?.value;
    const employeeNumberValue = attributesSend.find(
      (a) => a.name === "employee_number"
    )?.value;
    const permissionMapValue = attributesSend.find(
      (a) => a.name === "permissions_map"
    )?.value;
    const delegationProofIndex = attributesSend.findIndex(
      (a) => a.name === "delegation_proof"
    );

    // Only update if all dependencies exist
    if (
      delegationIdValue &&
      employeeNumberValue &&
      permissionMapValue &&
      delegationProofIndex !== -1
    ) {
      (async () => {
        const proof = await generateDelegationProof(
          delegationIdValue,
          employeeNumberValue,
          permissionMapValue,
          SECRET_KEY
        );
        // Only update if value is different to avoid infinite loop
        if (attributesSend[delegationProofIndex].value !== proof) {
          const newAttributes = [...attributesSend];
          newAttributes[delegationProofIndex] = {
            ...newAttributes[delegationProofIndex],
            value: proof,
          };
          setAttributesSend(newAttributes);
        }
      })();
    }
  }, [attributesSend, SECRET_KEY]);

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
                      Send Cred
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

      {/* Send Credential Section */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold s">Send Credential</h2>
        {/* show the fetched public did */}
        {publicDid && (
          <div className="mb-1">
            <p className="text-sm text-gray-500">Public DID: {publicDid}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCredential();
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Connection ID
              </label>
              <select
                value={selectedConnectionIdSend}
                onChange={(e) => setSelectedConnectionIdSend(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="">Select Connection</option>
                {connectionsData.map((connection: any) => (
                  <option
                    key={connection.connection_id}
                    value={connection.connection_id}
                  >
                    {connection.their_label || connection.connection_id}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Credential Definition ID
              </label>
              <div className="flex space-x-2">
                <input
                  list="cred-def-ids"
                  type="text"
                  value={selectedCredDefIdSend}
                  onChange={(e) => setSelectedCredDefIdSend(e.target.value)}
                  placeholder="Enter Credential Definition ID"
                  className="border rounded px-2 py-1 w-full"
                />
                <button
                  type="button"
                  onClick={handleFetchAttributesFromCredDef}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-1 px-2 rounded"
                  title="Fetch Attributes from Credential Definition"
                >
                  Fetch Attributes
                </button>
              </div>
              <datalist id="cred-def-ids">
                {availableCredDefIdsSend.map((defId) => (
                  <option key={defId} value={defId} />
                ))}
              </datalist>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Credential Attributes
              </label>
              {attributesSend.map((attr, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Attribute Name"
                    value={attr.name}
                    onChange={(e) => {
                      handleAttributeChangeSend(index, "name", e.target.value);

                      // Auto-generate delegation_id value when name is set
                      // if (e.target.value === "delegation_id" && !attr.value) {
                      //   const uuid =
                      //     typeof crypto !== "undefined" && crypto.randomUUID
                      //       ? crypto.randomUUID()
                      //       : `${Date.now()}-${Math.floor(
                      //           Math.random() * 1e9
                      //         )}`;
                      //   handleAttributeChangeSend(index, "value", uuid);
                      // }
                    }}
                    className="border rounded px-2 py-1 w-1/2"
                  />
                  {attr.name === "credential_type" ? (
                    <>
                      <input
                        list="credential-type-options"
                        type="text"
                        value={attr.value}
                        onChange={(e) =>
                          handleAttributeChangeSend(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Select or type credential type"
                        className="border rounded px-2 py-1 w-1/2"
                      />
                      <datalist id="credential-type-options">
                        <option value="employeeId" />
                        <option value="basePermission" />
                        <option value="delegatedPermission" />
                      </datalist>
                    </>
                  ) : attr.name === "delegated_by" ? (
                    <>
                      <input
                        list="delegated-by-options"
                        type="text"
                        value={attr.value}
                        onChange={(e) =>
                          handleAttributeChangeSend(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Select or type delegated_by"
                        className="border rounded px-2 py-1 w-1/2"
                      />
                      <datalist id="delegated-by-options">
                        {publicDid && <option value={publicDid} />}
                      </datalist>
                    </>
                  ) : attr.name === "delegation_allowed" ? (
                    <>
                      <input
                        list="delegation-allowed-options"
                        type="text"
                        value={attr.value}
                        onChange={(e) =>
                          handleAttributeChangeSend(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Select or type delegation_allowed"
                        className="border rounded px-2 py-1 w-1/2"
                      />
                      <datalist id="delegation-allowed-options">
                        <option value="true" />
                        <option value="false" />
                      </datalist>
                    </>
                  ) : attr.name === "delegation_id" ? (
                    <input
                      type="text"
                      placeholder="Delegation ID"
                      value={attr.value}
                      readOnly
                      className="border rounded px-2 py-1 w-1/2 bg-gray-100"
                    />
                  ) : attr.name === "delegation_proof" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Delegation Proof"
                        value={attr.value}
                        readOnly
                        className="border rounded px-2 py-1 w-1/2 bg-gray-100"
                      />
                      {/* <button
                        type="button"
                        className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs border px-2 py-1 rounded"
                        onClick={async () => {
                          // Find values from attributesSend
                          const delegation_id =
                            attributesSend.find(
                              (a) => a.name === "delegation_id"
                            )?.value || "";
                          const employee_number =
                            attributesSend.find(
                              (a) => a.name === "employee_number"
                            )?.value || "";
                          const permission_map =
                            attributesSend.find(
                              (a) => a.name === "permissions_map"
                            )?.value || "";
                          const proof = await generateDelegationProof(
                            delegation_id,
                            employee_number,
                            permission_map,
                            SECRET_KEY
                          );
                          handleAttributeChangeSend(index, "value", proof);
                        }}
                      >
                        Generate Proof
                      </button> */}
                    </>
                  ) : attr.name === "permissions_map" ? (
                    <div className="border rounded p-2 bg-gray-50">
                      <label className="block text-xs font-semibold mb-1 text-gray-700">
                        Set Permissions:
                      </label>
                      {ROUTES.map((route) => {
                        // Parse current value or default to all read
                        const currentPerms = attr.value
                          ? parsePermissionMap(attr.value)[route] || []
                          : [];
                        return (
                          <div key={route} className="flex items-center mb-1">
                            <span className="w-40 capitalize">
                              {route.replace("_", " ")}:
                            </span>
                            {PERMISSIONS.map((perm) => (
                              <label
                                key={perm}
                                className="ml-2 flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={currentPerms.includes(perm)}
                                  onChange={(e) => {
                                    // Build new permissions object
                                    const map = attr.value
                                      ? parsePermissionMap(attr.value)
                                      : {};
                                    const permsSet = new Set(map[route] || []);
                                    if (e.target.checked) {
                                      permsSet.add(perm);
                                    } else {
                                      permsSet.delete(perm);
                                    }
                                    map[route] = Array.from(permsSet);
                                    // Remove empty arrays
                                    if (map[route].length === 0)
                                      delete map[route];
                                    handleAttributeChangeSend(
                                      index,
                                      "value",
                                      stringifyPermissionMap(map)
                                    );
                                  }}
                                />
                                <span className="ml-1 text-xs">{perm}</span>
                              </label>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : attr.name === "valid_from" ||
                    attr.name === "valid_until" ? (
                    <input
                      type="date"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChangeSend(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 w-1/2"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Attribute Value"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChangeSend(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 w-1/2"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttributeSend(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAttributeSend}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Add Attribute
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                value={commentSend}
                onChange={(e) => setCommentSend(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              disabled={
                !selectedConnectionIdSend || attributesSend.length === 0
              }
            >
              Send Credential
            </button>
          </form>
        </div>
      </div>

      {/* details of selected credential */}
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
