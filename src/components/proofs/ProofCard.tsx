import React from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface ProofCardProps {
  proof: {
    presentation_exchange_id: string;
    state: string;
    connection_id: string;
    verified?: boolean;
  };
}

export const ProofCard = ({ proof }: ProofCardProps) => {
  const getStateIcon = () => {
    if (proof.state === 'verified') return <CheckCircle className="text-green-500" />;
    if (proof.state === 'failed') return <XCircle className="text-red-500" />;
    return <Shield className="text-blue-500" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">Proof Request</div>
        {getStateIcon()}
      </div>
      <div className="text-sm text-gray-600">ID: {proof.presentation_exchange_id}</div>
      <div className="text-sm text-gray-600">State: {proof.state}</div>
      <div className="text-sm text-gray-600">Connection: {proof.connection_id}</div>
      {proof.verified !== undefined && (
        <div className={`text-sm ${proof.verified ? 'text-green-600' : 'text-red-600'}`}>
          {proof.verified ? 'Verified' : 'Not Verified'}
        </div>
      )}
    </div>
  );
};