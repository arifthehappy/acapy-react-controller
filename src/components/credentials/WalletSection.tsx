import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import { credentialsAPI } from "../../api/credentials";
import { useWallet } from "../../hooks/useWallet";
import {
  Eye,
  EyeOff,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Tooltip } from "react-tooltip";

interface Credential {
  referent: string;
  attrs: {
    [key: string]: string;
  };
  schema_id: string | null;
  cred_def_id: string | null;
  rev_reg_id?: string | null;
  cred_rev_id?: string | null;
}

export const WalletSection = () => {
  // const [selectedCredential, setSelectedCredential] =useState<Credential | null>(null);
  const [showAttributes, setShowAttributes] = useState<{
    [key: string]: boolean;
  }>({});

  const { data: walletCredentials = [], isLoading, error } = useWallet();
  console.log("walletCredentials:", walletCredentials);

  const toggleAttributeVisibility = (credentialId: string) => {
    setShowAttributes((prev) => ({
      ...prev,
      [credentialId]: !prev[credentialId],
    }));
  };

  const handleDelete = async (credentialId: string) => {
    await credentialsAPI.deleteCredential(credentialId);
    window.location.reload();
  };

  const getCredentialStatus = (credential: Credential) => {
    if (credential.rev_reg_id && credential.cred_rev_id) {
      return "revocable";
    }
    return "non-revocable";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "revocable":
        return (
          <div>
            <Clock
              className="text-yellow-500"
              size={20}
              data-tooltip-id="revocation-status"
              data-tooltip-content="This credential is revocable"
            />
          </div>
        );
      case "non-revocable":
        return (
          <div>
            <CheckCircle2
              className="text-green-500"
              size={20}
              data-tooltip-id="non-revocation-status"
              data-tooltip-content="This credential is non-revocable"
            />
          </div>
        );
      default:
        return (
          <XCircle
            className="text-red-500"
            size={20}
            data-tooltip-id="revocation-status"
            data-tooltip-content="Unknown revocation status"
          />
        );
    }
  };

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
          Error loading wallet credentials: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Stored Credentials</h3>
        {walletCredentials && walletCredentials.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No credentials stored in wallet
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {walletCredentials &&
              walletCredentials.map((credential: Credential) => (
                <div
                  key={credential.referent}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow hover:bg-blue-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {credential?.schema_id
                          ? credential.schema_id.split(":").slice(-2)[0]
                          : "Unnamed Credential"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ID: {credential?.referent}
                      </p>
                    </div>
                    {getStatusIcon(getCredentialStatus(credential))}
                    <Tooltip id="revocation-status" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Schema:{" "}
                      {credential?.schema_id ? credential.schema_id : "Unknown"}
                    </p>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Attributes</span>
                        <button
                          onClick={() =>
                            toggleAttributeVisibility(credential?.referent)
                          }
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {showAttributes[credential?.referent] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {showAttributes[credential?.referent] && (
                        <div className="bg-white p-2 rounded-md space-y-1">
                          {Object.entries(credential?.attrs).map(
                            ([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span>{" "}
                                <span className="text-gray-700">{value}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDelete(credential?.referent)}
                      className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
