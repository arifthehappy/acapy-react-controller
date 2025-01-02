import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proofs } from '../../api/agent';

export const RequestProof = ({ connectionId }: { connectionId: string }) => {
  const [proofRequest, setProofRequest] = useState({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => proofs.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proofs'] });
    }
  });

  const handleRequest = () => {
    mutation.mutate({
      connection_id: connectionId,
      proof_request: proofRequest
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Request Proof</h3>
      <button
        onClick={handleRequest}
        disabled={mutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {mutation.isPending ? 'Requesting...' : 'Request Proof'}
      </button>
    </div>
  );
};