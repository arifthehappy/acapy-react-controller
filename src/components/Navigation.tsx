import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { Users, Key, FileCheck, Shield, CheckCircle, XCircle, Loader, Database } from 'lucide-react';
import {server} from "../api/agent"
import { Tooltip} from 'react-tooltip';
import {User_Name} from '../config/constants'


export const Navigation = () => {
  const [agentStatus, setAgentStatus] = useState('unknown');

  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const response = await server.getStatus();
        console.log('Agent status:', response.data);
        setAgentStatus("up");
      } catch (error) {
        setAgentStatus("down");
        console.error('Error fetching agent status:', error);
      }
    };

    fetchAgentStatus();
  }, []);

   const renderStatusIcon = () => {
    if (agentStatus === 'up') {
      return <CheckCircle className="text-green-500" size={20} data-tooltip-id="agent-status-tooltip" data-tooltip-content="agent status is up" />;
    } else if (agentStatus === 'down') {
      return <XCircle className="text-red-500" size={20} data-tooltip-id="agent-status-tooltip" data-tooltip-content="agent status is down" />;
    } else {
      return <Loader className="text-gray-500 animate-spin" size={20} />;
    }
  };


  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold flex items-center mx-auto md:mx-2 justify-between">
          {User_Name} 
          <div className="flex items-center space-x-2">
          {renderStatusIcon()}
          <Tooltip id="agent-status-tooltip" />
          </div>
        </div>
         
        <div className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-2 w-full md:w-auto">
          <Link to="/connections" className="flex items-center space-x-2 hover:text-gray-300">
            <Users size={20} />
            <span>Connections</span>
          </Link>
          <Link to="/credentials" className="flex items-center space-x-2 hover:text-gray-300">
            <Key size={20} />
            <span>Credentials</span>
          </Link>
          <Link to="/proofs" className="flex items-center space-x-2 hover:text-gray-300">
            <Shield size={20} />
            <span>Proofs</span>
          </Link>
          <Link to="/schemas" className="flex items-center space-x-2 hover:text-gray-300">
            <FileCheck size={20} />
            <span>Schemas</span>
          </Link>
          <Link to="/credential-definitions" className="flex items-center space-x-2 hover:text-gray-300">
            <Database size={20} />
            <span>Definitions</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};