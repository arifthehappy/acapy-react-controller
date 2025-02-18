import axios from 'axios';
import { AGENT_URL } from '../config/constants';
// import { credential } from '@/store/modules/credential/credential';

const api = axios.create({ baseURL: AGENT_URL });

//Holder Credential Management
export const credentialsAPI = {
    //1. Get all credentials
    getAllCredentials: () => api.get('/credentials'),
    //2. Get specific credential
    getById: (credentialId: string) => api.get(`/credential/${credentialId}`),
    //3. Delete credential from wallet
    deleteCredential: (credentialId: string) => api.delete(`/credential/${credentialId}`),
    //4. revoke status of credential
    isCredentialRevoked: (credentialId: string) => api.get(`/credential/revoked/${credentialId}`),
    // 5. credential Mime Types
    credentialMimeTypes: (credentialId: string) => api.get(`/credential/mime-types/${credentialId}`),

};