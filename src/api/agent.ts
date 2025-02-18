import axios from 'axios';
import { AGENT_URL } from '../config/constants';

const api = axios.create({
  baseURL: AGENT_URL,
});

// Connection APIs
export const connections = {
  getAll: () => api.get('/connections'),
  getById: (id: string) => api.get(`/connections/${id}`),
  createInvitation: () => api.post('/connections/create-invitation'),
  receiveInvitation: (invitation: any) => api.post('/connections/receive-invitation', invitation),
  removeConnection: (id: string) => api.delete(`/connections/${id}`),
  acceptInvitation: (id: string) => api.post(`/connections/${id}/accept-invitation`),
  acceptRequest: (id: string) => api.post(`/connections/${id}/accept-request`),
  sendBasicMessage: (id: string, content: string) => 
    api.post(`/connections/${id}/send-message`, { content }),
};

// Credential Definition APIs
export const credentialDefinitions = {
  create: (data: any) => api.post('/credential-definitions', data),
  getCreated: () => api.get('/credential-definitions/created'),
  getById: (id: string) => api.get(`/credential-definitions/${id}`),
  writeRecord: (id: string) => api.post(`/credential-definitions/${id}/write_record`),
};

// Schema APIs
export const schemas = {
  create: (data: any) => api.post('/schemas', data),
  getCreated: () => api.get('/schemas/created'),
  getById: (id: string) => api.get(`/schemas/${id}`),
};

// Issue Credential APIs
export const credentialsExchange = {
  createOffer: (data: any) => api.post('/issue-credential-2.0/send-offer', data),
  getRecords: () => api.get('/issue-credential-2.0/records'),
  getById: (id: string) => api.get(`/issue-credential-2.0/records/${id}`),
  sendOffer: (id: string) => 
    api.post(`/issue-credential-2.0/records/${id}/send-offer`),
};

// Present Proof APIs
export const proofs = {
  createRequest: (data: any) => api.post('/present-proof/create-request', data),
  getRecords: () => api.get('/present-proof/records'),
  getById: (id: string) => api.get(`/present-proof/records/${id}`),
  verifyPresentation: (id: string) => 
    api.post(`/present-proof/records/${id}/verify-presentation`),
};

// Server Status APIs
export const server = {
  getStatus: () => api.get('/status'),
  getFeatures: () => api.get('/features'),
};