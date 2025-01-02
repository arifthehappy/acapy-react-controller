import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { credentials } from '../../api/agent';

export const IssueCredential = ({ connectionId }: { connectionId: string }) => {
  const [credentialData, setCredentialData] = useState({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => credentials.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    }
  });

  const handleIssue = () => {
    mutation.mutate({
      connection_id: connectionId,
      credential_preview: {
        attributes: Object.entries(credentialData).map(([name, value]) => ({
          name,
          value: String(value)
        }))
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Issue Credential</h3>
      <button
        onClick={handleIssue}
        disabled={mutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {mutation.isPending ? 'Issuing...' : 'Issue Credential'}
      </button>
    </div>
  );
};