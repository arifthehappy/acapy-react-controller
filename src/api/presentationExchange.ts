import axios from 'axios';
import { AGENT_URL } from '../config/constants';

const api = axios.create({ baseURL: AGENT_URL });

export const presentationExchange = {
  // Verifier APIs
  sendRequest: (connectionId: string, proofRequest: any) =>
    api.post('/present-proof-2.0/send-request', {
      connection_id: connectionId,
      proof_request: proofRequest
    }),

  verifyPresentation: (presExId: string) =>
    api.post(`/present-proof-2.0/records/${presExId}/verify-presentation`),

  // Holder APIs
  sendPresentation: (presExId: string, credentialId: string) =>
    api.post(`/present-proof-2.0/records/${presExId}/send-presentation`, {
      requested_attributes: {
        [credentialId]: {
          cred_id: credentialId,
          revealed: true
        }
      }
    }),

  // Common APIs
  getRecords: () => api.get('/present-proof-2.0/records'),
  getById: (presExId: string) => 
    api.get(`/present-proof-2.0/records/${presExId}`),
  deleteRecord: (presExId: string) =>
    api.delete(`/present-proof-2.0/records/${presExId}`)
  
};