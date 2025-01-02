import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connections } from '../../api/agent';
import { QrCode } from 'lucide-react';

export const CreateInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => connections.createInvitation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Create Connection Invitation</h3>
      {mutation.data && (
        <div className="mb-4">
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(mutation.data.data, null, 2)}
            </pre>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <QrCode size={20} />
            <span className="text-sm text-gray-600">Scan QR code to connect</span>
          </div>
        </div>
      )}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {mutation.isPending ? 'Creating...' : 'Create Invitation'}
      </button>
    </div>
  );
};