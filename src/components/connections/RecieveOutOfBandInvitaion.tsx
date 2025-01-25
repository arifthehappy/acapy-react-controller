import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {outOfBand} from "../../api/outOfBand"; 
export const RecieveOutOfBandInvitation = () => {
  const [invitation, setInvitation] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (invitation: string) => {
      console.log('Sending invitation:', invitation); // Log the invitation
      return outOfBand.receiveInvitation(invitation).then(response => response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error) => {
      console.error('Error receiving invitation:', error); // Log the error
    }
  });

 const handleSubmit = () => {
    try {
      const parsedInvitation = JSON.parse(invitation); // Ensure the invitation is valid JSON
      mutation.mutate(parsedInvitation);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Receive Out-of-Band Invitation</h3>
      <textarea
        value={invitation}
        onChange={(e) => setInvitation(e.target.value)}
        placeholder="Paste the invitation JSON here"
        className="w-full h-32 p-2 border rounded mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={mutation.status === 'pending'}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {mutation.status === 'pending' ? 'Submitting...' : 'Submit Invitation'}
      </button>
      {mutation.isError && <p className="text-red-500 mt-2">Error submitting invitation.</p>}
      {mutation.isSuccess && <p className="text-green-500 mt-2">Invitation submitted successfully.</p>}
    </div>
  );
}
