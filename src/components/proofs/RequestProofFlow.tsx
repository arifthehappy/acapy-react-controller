import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { presentationExchange } from '../../api/presentationExchange';

interface RequestProofFlowProps {
  connectionId: string;
  onComplete?: () => void;
}

export const RequestProofFlow = ({ connectionId, onComplete }: RequestProofFlowProps) => {
  const requestMutation = useMutation({
    mutationFn: () => presentationExchange.sendRequest(connectionId, {
      name: 'Proof Request',
      version: '1.0',
      requested_attributes: {
        name: {
          name: 'name',
          restrictions: []
        }
      }
    }),
    onSuccess: () => {
      onComplete?.();
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Request Proof</h3>
      <button
        onClick={() => requestMutation.mutate()}
        disabled={requestMutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {requestMutation.isPending ? 'Requesting...' : 'Request Proof'}
      </button>
    </div>
  );
};