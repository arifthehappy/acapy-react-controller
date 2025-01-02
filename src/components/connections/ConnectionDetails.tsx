import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { connections } from '../../api/agent';
import { MessageForm } from './MessageForm';

export const ConnectionDetails = ({ connectionId }: { connectionId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['connection', connectionId],
    queryFn: () => connections.getById(connectionId)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Connection Details</h3>
        <div className="space-y-2">
          <p><span className="font-medium">ID:</span> {data?.data.connection_id}</p>
          <p><span className="font-medium">State:</span> {data?.data.state}</p>
          <p><span className="font-medium">Label:</span> {data?.data.their_label}</p>
        </div>
      </div>
      <MessageForm connectionId={connectionId} />
    </div>
  );
};