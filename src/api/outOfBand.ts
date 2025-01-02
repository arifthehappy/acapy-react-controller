import axios from 'axios';
import { AGENT_URL } from '../config/constants';

const api = axios.create({ baseURL: AGENT_URL });

export const outOfBand = {
  createInvitation: () => api.post('/out-of-band/create-invitation', {
    handshake_protocols: ['https://didcomm.org/connections/1.0'],
    use_public_did: false
  }),
  receiveInvitation: (invitation: any) => 
    api.post('/out-of-band/receive-invitation', invitation)
};