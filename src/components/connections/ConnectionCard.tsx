import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { connections } from '../../api/agent';

interface Connection {
  [key: string]: any;
  connection_id: string;
  state: string;
  updated_at?: string;
  their_label?: string;
}

interface ConnectionCardProps {
  connection: Connection;
}

export const ConnectionCard = ({ connection }: ConnectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = async () => {
    await connections.removeConnection(connection.connection_id);
    window.location.reload();
  };

  // Keys to show always in small text
  const alwaysVisibleKeys = ['connection_id', 'state', 'updated_at'];

  // Filter out the always-visible keys so we only show them again if expanded
  const detailEntries = Object.entries(connection).filter(
    ([key]) => !alwaysVisibleKeys.includes(key)
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Show label */}
      <div className="font-bold">{connection.their_label || 'Unknown'}</div>

      {/* Always-visible keys */}
      <div
        className="text-sm text-gray-600 cursor-pointer flex items-center"
        title="Click to copy"
        onClick={() => navigator.clipboard.writeText(connection.connection_id)}
      >
        Connection ID: {connection.connection_id}
       <Copy className="ml-2 text-blue-500" />
      </div>
      <div className="text-sm text-gray-600">State: {connection.state}</div>
      {connection.updated_at && (
        <div className="text-sm text-gray-600">Updated At: {connection.updated_at}</div>
      )}

      {/* Toggle button */}
      <button
        onClick={handleToggleDetails}
        className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block"
      >
        {isExpanded ? 'Hide Details' : 'View Details'}
      </button>

      {/* Conditionally render all other key-value pairs */}
      {isExpanded && (
        <div className="mt-2">
          {detailEntries.map(([key, value]) => (
            <div key={key} className="text-sm text-gray-600">
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 text-sm mt-2 inline-block ml-4"
      >
        Delete
      </button>
    </div>
  );
};