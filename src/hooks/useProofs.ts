import { useQuery } from '@tanstack/react-query';
import { presentationExchange } from '../api/presentationExchange';

export const useProofs = () => {
  return useQuery({
    queryKey: ['proofs'],
    queryFn: async () => {
      const response = await presentationExchange.getRecords();
      return response.data?.results || [];
    }
  });
};

export const useProof = (proofId: string) => {
  return useQuery({
    queryKey: ['proofs', proofId],
    queryFn: async () => {
      const response = await presentationExchange.getById(proofId);
      return response.data;
    },
    enabled: !!proofId
  });
};