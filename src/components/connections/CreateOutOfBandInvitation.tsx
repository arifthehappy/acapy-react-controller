import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { outOfBand } from '../../api/outOfBand';
import { Copy, QrCode } from 'lucide-react';

export const CreateOutOfBandInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: outOfBand.createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Create OOB Connection Invitation</h3>
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
            <span className='text-sm text-gray-600 cursor-pointer flex items-center'
           onClick={() => navigator.clipboard.writeText(JSON.stringify(mutation.data.data.invitation, null, 2))}>
              Click to copy<Copy className="ml-2 text-blue-500" /></span> 
          </div>
        </div>
      ) }
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