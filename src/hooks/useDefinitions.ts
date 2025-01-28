import { useQuery } from '@tanstack/react-query';
import { credentialDefinitions } from '../api/agent';

export const useDefinitions = () => {
    return useQuery({
        queryKey: ['definitions'],
        queryFn: async () => {
            try {
                const response = await credentialDefinitions.getCreated();
                console.log(response, 'response');
                if (!response.data) {
                    throw new Error('No data received from credential definitions');
                }
                return response.data.results || [];
            } catch (error) {
                console.error('Failed to fetch credential definitions:', error);
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 2
    });
};