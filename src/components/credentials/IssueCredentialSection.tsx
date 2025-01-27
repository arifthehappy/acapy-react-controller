import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connections } from '../../api/agent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialExchange } from '../../api/credentialExchange';
import { CredentialCard } from './CredentialCard';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useConnections } from '../../hooks/useConnections';

interface IssueCredentialSectionProps {
  credentials: any[];
}

export const IssueCredentialSection = ({ credentials }: IssueCredentialSectionProps) => {
  const queryClient = useQueryClient();
  const [selectedCredential, setSelectedCredential] = useState<any>(null);

  const issueCredentialMutation = useMutation({
    mutationFn: (credExId: string) => credentialExchange.issueCredential(credExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });

  const sendOfferMutation = useMutation({
    mutationFn: (credExId: string) => credentialExchange.sendOffer(credExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });

  const handleIssue = (credExId: string) => {
    issueCredentialMutation.mutate(credExId);
  };

  const handleSendOffer = (credExId: string) => {
    sendOfferMutation.mutate(credExId);
  };

  const issuableCredentials = credentials.filter(
    cred => cred.cred_ex_record.state === 'proposal-received' || cred.cred_ex_record.state === 'request-received'
  );

const { data: connectionsData =[], isLoading, error } = useConnections();


const getConnectionLabel = (connectionId: string) => {
    const connection = connectionsData?.find((conn: any) => conn.connection_id === connectionId);
    return connection?.their_label || 'No Alias';
};

const connectionLabel = selectedCredential ? getConnectionLabel(selectedCredential.cred_ex_record.connection_id) : '';


  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
        {issuableCredentials.length === 0 ? (
          <div className="text-gray-500">No pending credential requests</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3     ">
            {issuableCredentials.map((credential) => (
              <div
                key={credential.cred_ex_record.cred_ex_id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedCredential?.cred_ex_record.cred_ex_id === credential.cred_ex_record.cred_ex_id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedCredential(credential)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {credential.cred_ex_record.cred_proposal?.credential_preview?.attributes?.[0]?.value || 'Unnamed Credential'}
                  </span>
                  {credential.cred_ex_record.state === 'proposal-received' && <Clock className="text-blue-500" size={20} />}
                  {credential.cred_ex_record.state === 'request-received' && <CheckCircle2 className="text-green-500" size={20} />}
                  {credential.cred_ex_record.state === 'abandoned' && <XCircle className="text-red-500" size={20} />}
                </div>
                <div className="text-sm text-gray-600">
                   {connectionLabel &&  <p>Connection: {connectionLabel}</p> }
                  <p className='font-semibold'>Request Comment: {credential.cred_ex_record.cred_proposal?.comment}</p>
                  <p className='font-semibold'>State: {credential.cred_ex_record.state}</p>
                <div className="border rounded-lg p-2 bg-gray-50">
                  {credential.cred_ex_record.cred_proposal?.credential_preview?.attributes?.map((attr: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-1">
                          <span className="font-medium text-gray-700">{attr.name}:</span>
                          <span className="text-gray-900">{attr.value}</span>
                      </div>
                  ))}
                </div>
                <p>Updated: {new Date(credential.cred_ex_record.updated_at).toLocaleString()}</p>
                <p>Connection ID: {credential.cred_ex_record.connection_id}</p>
                


                </div>
                <div className="mt-4 space-x-2">
                  {credential.cred_ex_record.state === 'proposal-received' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendOffer(credential.cred_ex_record.cred_ex_id);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Send Offer
                    </button>
                  )}
                  {credential.state === 'request-received' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIssue(credential.cred_ex_record.cred_ex_id);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCredential && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Selected Credential Details <button
                onClick={() => setSelectedCredential(null)}
                className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block flex items-center"
            >
                Hide Details <XCircle size={16} />
            </button></h3>
            
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(selectedCredential, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};