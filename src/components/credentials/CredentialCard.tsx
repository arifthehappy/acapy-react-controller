import React from 'react';

interface CredentialCardProps {
  credential: {
    credential_exchange_id: string;
    state: string;
    connection_id: string;
  };
}

export const CredentialCard = ({ credential }: CredentialCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="font-bold">Credential Exchange</div>
      <div className="text-sm text-gray-600">ID: {credential.credential_exchange_id}</div>
      <div className="text-sm text-gray-600">State: {credential.state}</div>
      <div className="text-sm text-gray-600">Connection: {credential.connection_id}</div>
    </div>
  );
};