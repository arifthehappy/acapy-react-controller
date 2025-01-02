import React from 'react';
import { useCredentials } from '../hooks/useCredentials';
import { CredentialCard } from './credentials/CredentialCard';

export const CredentialsList = () => {
  const { data: credentials = [], isLoading, error } = useCredentials();

  if (isLoading) {
    return <div>Loading credentials...</div>;
  }

  if (error) {
    return <div>Error loading credentials: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Credentials</h2>
      <div className="grid gap-4">
        {credentials.map((credential: any) => (
          <CredentialCard key={credential.credential_exchange_id} credential={credential} />
        ))}
      </div>
    </div>
  );
};