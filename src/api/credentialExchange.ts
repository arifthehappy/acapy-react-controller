import axios from 'axios';
import { AGENT_URL } from '../config/constants';

const api = axios.create({ baseURL: AGENT_URL });

export const credentialExchange = {
  // Holder APIs
  sendProposal: (connectionId: string, credentialProposal: any) =>
    api.post('/issue-credential-2.0/send-proposal', {
      connection_id: connectionId,
      credential_proposal: credentialProposal
    }),

  sendRequest: (credExId: string) =>
    api.post(`/issue-credential-2.0/records/${credExId}/send-request`),

  storeCredential: (credExId: string) =>
    api.post(`/issue-credential-2.0/records/${credExId}/store`),

  // Issuer APIs
  sendOffer: (credExId: string) =>
    api.post(`/issue-credential-2.0/records/${credExId}/send-offer`),

  issueCredential: (credExId: string) =>
    api.post(`/issue-credential-2.0/records/${credExId}/issue`),

  sendCredential: () =>
    api.post(`/issue-credential-2.0/records/send`),

  // Common APIs
  getRecords: () => api.get('/issue-credential-2.0/records'),
  getById: (credExId: string) => 
    api.get(`/issue-credential-2.0/records/${credExId}`)
};