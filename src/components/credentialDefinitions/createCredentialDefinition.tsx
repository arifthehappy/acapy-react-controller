import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { credentialDefinitions, schemas } from "../../api/agent";
import { useQuery } from "@tanstack/react-query";
import { Plus, AlertCircle, SwitchCamera } from "lucide-react";
import { CRED_DEF_DEFAULTS } from "../../config/constants";

export const CreateCredentialDefinition = () => {
  const [selectedSchemaId, setSelectedSchemaId] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);
  const [tag, setTag] = useState(CRED_DEF_DEFAULTS.tag);
  const [revocationRegistrySize, setRevocationRegistrySize] = useState(
    CRED_DEF_DEFAULTS.revocation_registry_size
  );
  const [supportRevocation, setSupportRevocation] = useState(
    CRED_DEF_DEFAULTS.support_revocation
  );
  const queryClient = useQueryClient();

  const { data: schemasData, isLoading: schemasLoading } = useQuery({
    queryKey: ["schemas"],
    queryFn: () => schemas.getCreated(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => credentialDefinitions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentialDefinitions"] });
      setSelectedSchemaId("");
      setTag(CRED_DEF_DEFAULTS.tag);
      setSupportRevocation(CRED_DEF_DEFAULTS.support_revocation);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemaId) return;

    const payload: any = {
      schema_id: selectedSchemaId,
      tag: tag,
    };

    if (supportRevocation) {
      payload.support_revocation = true;
      payload.revocation_registry_size = revocationRegistrySize;
    }

    mutation.mutate(payload);
  };

  if (schemasLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        Loading schemas...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-6"
    >
      <div>
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
            <span>{isManualInput ? "Select from list" : "Enter manually"}</span>
          </button>
        </div>

        {isManualInput ? (
          <input
            type="text"
            value={selectedSchemaId}
            onChange={(e) => setSelectedSchemaId(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter schema ID..."
            required
          />
        ) : (
          <select
            value={selectedSchemaId}
            onChange={(e) => setSelectedSchemaId(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select a schema...</option>
            {schemasData?.data.schema_ids?.map((schemaId: string) => (
              <option key={schemaId} value={schemaId}>
                {schemaId}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag
        </label>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="supportRevocation"
          checked={supportRevocation}
          onChange={(e) => setSupportRevocation(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label
          htmlFor="supportRevocation"
          className="text-sm font-medium text-gray-700"
        >
          Support Revocation
        </label>
      </div>

      {supportRevocation && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Revocation Registry Size
          </label>
          <input
            type="number"
            value={revocationRegistrySize}
            onChange={(e) =>
              setRevocationRegistrySize(parseInt(e.target.value))
            }
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      )}

      {supportRevocation && (
        <div className="flex items-center space-x-2 bg-yellow-50 p-4 rounded-md">
          <AlertCircle className="text-yellow-600" size={20} />
          <p className="text-sm text-yellow-700">
            Enabling revocation will require additional setup for the tails file
            server.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !selectedSchemaId}
        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Plus size={20} />
        <span>
          {mutation.isPending ? "Creating..." : "Create Credential Definition"}
        </span>
      </button>

      {mutation.isError && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">
            Error creating credential definition
          </p>
        </div>
      )}
    </form>
  );
};
