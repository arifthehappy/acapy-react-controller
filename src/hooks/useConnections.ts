import { useQuery } from '@tanstack/react-query';
import { connections } from '../api/agent';

export const useConnections = () => {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const response = await connections.getAll();
      if (!response.data) {
        throw new Error('No data received from connections');
      }
      return response.data?.results || [];
    }
  });
};