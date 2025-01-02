import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { connections } from '../../api/agent';

export const MessageForm = ({ connectionId }: { connectionId: string }) => {
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: (content: string) => connections.sendBasicMessage(connectionId, content),
    onSuccess: () => {
      setMessage('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(message);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Send Message</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {mutation.isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};