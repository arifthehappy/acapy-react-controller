import { useQuery } from '@tanstack/react-query';
import { credentials } from '../api/agent';

export const useCredentials = () => {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await credentials.getRecords();
      return response.data?.results || [];
    }
  });
};