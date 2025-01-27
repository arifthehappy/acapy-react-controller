import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface CredentialCardProps {
  credential: {
    credential_exchange_id: string;
    state: string;
    connection_id: string;
    created_at: string;
    updated_at: string;
    credential_proposal_dict?: {
      credential_proposal?: {
        attributes?: Array<{
          name: string;
          value: string;
        }>;
      };
    };
  };
}


export const CredentialCard = ({ credential }: CredentialCardProps) => {

   const getStateIcon = () => {
    switch (credential.state) {
      case 'offer-sent':
      case 'offer-received':
        return <Clock className="text-blue-500" size={20} />;
      case 'credential-issued':
      case 'done':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'abandoned':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

    const getStateColor = () => {
    switch (credential.state) {
      case 'offer-sent':
      case 'offer-received':
        return 'text-blue-600';
      case 'credential-issued':
      case 'done':
        return 'text-green-600';
      case 'abandoned':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg">
            {credential.credential_proposal_dict?.credential_proposal?.attributes?.[0]?.value || 
             'Unnamed Credential'}
          </h4>
          <p className={`text-sm ${getStateColor()}`}>
            {credential.state}
          </p>
        </div>
        {getStateIcon()}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>ID: {credential.credential_exchange_id}</p>
        <p>Connection: {credential.connection_id}</p>
        <p>Created: {new Date(credential.created_at).toLocaleString()}</p>
        <p>Updated: {new Date(credential.updated_at).toLocaleString()}</p>
      </div>

      {credential.credential_proposal_dict?.credential_proposal?.attributes && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Attributes:</p>
          <div className="space-y-1">
            {credential.credential_proposal_dict.credential_proposal.attributes.map((attr, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{attr.name}:</span> {attr.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};