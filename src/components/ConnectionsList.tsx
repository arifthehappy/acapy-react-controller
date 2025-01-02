import React from 'react';
import { useConnections } from '../hooks/useConnections';
import { ConnectionCard } from './connections/ConnectionCard';
import { CreateOutOfBandInvitation } from './connections/CreateOutOfBandInvitation';

export const ConnectionsList = () => {
  const { data: connections = [], isLoading, error } = useConnections();

  if (isLoading) {
    return <div>Loading connections...</div>;
  }

  if (error) {
    return <div>Error loading connections: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Connections</h2>
      {/* <CreateInvitation /> */}
      <CreateOutOfBandInvitation />
      <div className="grid gap-4">
        {console.log(connections)}
        {connections.map((connection: any) => (
          <ConnectionCard key={connection.connection_id} connection={connection} />
        ))}
      </div>
    </div>
  );
};