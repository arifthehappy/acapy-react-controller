import { useQuery } from '@tanstack/react-query';
import { credentialsAPI } from '../api/credentials';

export const useWallet = () => {
  return useQuery({
    queryKey: ['walletCredentials'],
    queryFn: async () => {
      const response = await credentialsAPI.getAllCredentials();
      console.log(response, 'response');
      return response?.data?.results || [];
    }
  });
};