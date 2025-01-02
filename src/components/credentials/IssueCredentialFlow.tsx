import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { credentialExchange } from '../../api/credentialExchange';

interface IssueCredentialFlowProps {
  connectionId: string;
  onComplete?: () => void;
}

export const IssueCredentialFlow = ({ connectionId, onComplete }: IssueCredentialFlowProps) => {
  const proposalMutation = useMutation({
    mutationFn: (proposal: any) => 
      credentialExchange.sendProposal(connectionId, proposal),
    onSuccess: () => {
      onComplete?.();
    }
  });

  const handleIssue = () => {
    proposalMutation.mutate({
      attributes: [
        { name: 'name', value: 'John Doe' },
        { name: 'age', value: '30' }
      ]
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Issue Credential</h3>
      <button
        onClick={handleIssue}
        disabled={proposalMutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {proposalMutation.isPending ? 'Issuing...' : 'Start Issuance'}
      </button>
    </div>
  );
};