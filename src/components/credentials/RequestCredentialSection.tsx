import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialExchange } from '../../api/credentialExchange';
import { useConnections } from '../../hooks/useConnections';
import { Plus, Loader } from 'lucide-react';

interface RequestCredentialSectionProps {
  credentials: any[];
}

export const RequestCredentialSection = ({ credentials }: RequestCredentialSectionProps) => {
  const queryClient = useQueryClient();
  const { data: connections = [] } = useConnections();
  const [selectedConnection, setSelectedConnection] = useState('');
  const [attributes, setAttributes] = useState([{ name: '', value: '' }]);

  const proposalMutation = useMutation({
    mutationFn: (data: any) => credentialExchange.sendProposal(data.connectionId, data.proposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      setAttributes([{ name: '', value: '' }]);
      setSelectedConnection('');
    },
  });

  const requestMutation = useMutation({
    mutationFn: (credExId: string) => credentialExchange.sendRequest(credExId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }]);
  };

  const handleAttributeChange = (index: number, field: 'name' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection) return;

    proposalMutation.mutate({
      connectionId: selectedConnection,
      proposal: {
        attributes: attributes.filter(attr => attr.name && attr.value),
      },
    });
  };

  const handleSendRequest = (credExId: string) => {
    requestMutation.mutate(credExId);
  };

  const receivedOffers = credentials.filter(cred => cred.state === 'offer-received');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Request New Credential</h3>
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Connection</label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a connection...</option>
              {connections.map((conn: any) => (
                <option key={conn.connection_id} value={conn.connection_id}>
                  {conn.their_label || conn.connection_id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Attributes</label>
            {attributes.map((attr, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAttribute}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={16} />
              <span>Add Attribute</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={proposalMutation.isPending || !selectedConnection}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {proposalMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="animate-spin" size={16} />
                <span>Sending Proposal...</span>
              </div>
            ) : (
              'Send Proposal'
            )}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Received Offers</h3>
        {receivedOffers.length === 0 ? (
          <div className="text-gray-500">No pending credential offers</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {receivedOffers.map((offer) => (
              <div key={offer.credential_exchange_id} className="border rounded-lg p-4">
                <div className="font-semibold mb-2">
                  Credential Offer from {offer.connection_id}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>State: {offer.state}</p>
                  <p>Created: {new Date(offer.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleSendRequest(offer.credential_exchange_id)}
                  disabled={requestMutation.isPending}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept Offer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};