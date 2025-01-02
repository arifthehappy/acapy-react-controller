import React from 'react';
import { useProofs } from '../hooks/useProofs';
import { ProofCard } from './proofs/ProofCard';

export const ProofsList = () => {
  const { data: proofs = [], isLoading, error } = useProofs();

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
        <div className="text-red-700">Error loading proofs: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Proof Requests</h2>
      {proofs.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
          No proof requests found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proofs.map((proof: any) => (
            <ProofCard key={proof.presentation_exchange_id} proof={proof} />
          ))}
        </div>
      )}
    </div>
  );
};