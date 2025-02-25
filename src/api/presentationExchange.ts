import axios from 'axios';
import { AGENT_URL } from '../config/constants';

const api = axios.create({ baseURL: AGENT_URL });

export const presentationExchange = {
  // Verifier APIs
  sendRequest: (connectionId: string, comment: string,presentationRequest: any) =>
    api.post('/present-proof-2.0/send-request', {
      connection_id: connectionId,
      comment: comment,
      presentation_request: {
        indy: presentationRequest
      }
    }),
    // console.log('presentationRequest', connectionId, comment, presentationRequest),

  verifyPresentation: (presExId: string) =>
    api.post(`/present-proof-2.0/records/${presExId}/verify-presentation`),

  // Holder APIs
  sendPresentation: (presExId: string, presentationResponse: any) =>
    api.post(`/present-proof-2.0/records/${presExId}/send-presentation`, {
      indy: presentationResponse
      
    }),

  // Common APIs
  getRecords: () => api.get('/present-proof-2.0/records'),
  getById: (presExId: string) => 
    api.get(`/present-proof-2.0/records/${presExId}`),
  deleteRecord: (presExId: string) =>
    api.delete(`/present-proof-2.0/records/${presExId}`)

};