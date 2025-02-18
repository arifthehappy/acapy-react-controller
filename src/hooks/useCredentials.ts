import { useQuery } from '@tanstack/react-query';
import { credentialExchange } from '../api/credentialExchange';

export const useCredentials = () => {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await credentialExchange.getRecords();
      return response.data?.results || [];
    }
  });
};