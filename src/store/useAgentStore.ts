import { create } from 'zustand';

interface AgentState {
  connections: any[];
  credentials: any[];
  proofs: any[];
  setConnections: (connections: any[]) => void;
  setCredentials: (credentials: any[]) => void;
  setProofs: (proofs: any[]) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  connections: [],
  credentials: [],
  proofs: [],
  setConnections: (connections) => set({ connections }),
  setCredentials: (credentials) => set({ credentials }),
  setProofs: (proofs) => set({ proofs }),
}));