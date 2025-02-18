import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Key,
  FileCheck,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  Database,
  Share2,
} from "lucide-react";
import { server } from "../api/agent";
import { Tooltip } from "react-tooltip";
import { User_Name } from "../config/constants";

export const Navigation = () => {
  const [agentStatus, setAgentStatus] = useState("unknown");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const response = await server.getStatus();
        if (response.data) {
          setAgentStatus("up");
          setErrorMessage(null);
        } else {
          setAgentStatus("down");
          setErrorMessage("No data received from agent");
        }
      } catch (error) {
        setAgentStatus("down");
        // Safely handle the error message
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to connect to agent"
        );
      }
    };

    fetchAgentStatus();

    // Poll status every 30 seconds
    const interval = setInterval(fetchAgentStatus, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const renderStatusIcon = () => {
    if (agentStatus === "up") {
      return (
        <CheckCircle
          className="text-green-500"
          size={20}
          data-tooltip-id="agent-status-tooltip"
          data-tooltip-content="Agent is connected and running"
        />
      );
    } else if (agentStatus === "down") {
      return (
        <XCircle
          className="text-red-500"
          size={20}
          data-tooltip-id="agent-status-tooltip"
          data-tooltip-content={errorMessage || "Agent is disconnected"}
        />
      );
    }
    return (
      <Loader
        className="text-gray-500 animate-spin"
        size={20}
        data-tooltip-id="agent-status-tooltip"
        data-tooltip-content="Checking agent status..."
      />
    );
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold flex items-center mx-auto md:mx-2 justify-between">
          {User_Name}
          <div className="flex items-center space-x-2 ml-2">
            {renderStatusIcon()}
            <Tooltip id="agent-status-tooltip" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-2 w-full md:w-auto">
          <Link
            to="/connections"
            className="flex items-center space-x-2 hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            <Users size={20} />
            <span>Connections</span>
          </Link>
          <Link
            to="/credentials"
            className="flex items-center space-x-2 hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            <Key size={20} />
            <span>Credentials</span>
          </Link>
          <Link
            to="/proofs"
            className="flex items-center space-x-2 hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            <Shield size={20} />
            <span>Proofs</span>
          </Link>
          <Link
            to="/schemas"
            className="flex items-center space-x-2 hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            <FileCheck size={20} />
            <span>Schemas</span>
          </Link>
          <Link
            to="/credential-definitions"
            className="flex items-center space-x-2 hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            <Database size={20} />
            <span>Definitions</span>
          </Link>
          <Link
            to="/delegation"
            className="flex items-center space-x-2 hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
          >
            <Share2 size={20} />
            <span>Delegation</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
