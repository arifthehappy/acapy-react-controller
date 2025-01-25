import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {Node_Server_URL} from "../config/constants";


const fetchMessages = async () => {
  const response = await axios.get(`${Node_Server_URL}/messages`); // Adjust the URL to your backend endpoint
  return response.data;
};

export const useMessages = () => {
  return useQuery({ queryKey: ['messages'], queryFn: fetchMessages });
};