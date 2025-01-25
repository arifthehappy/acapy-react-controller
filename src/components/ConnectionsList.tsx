import React, { useState } from 'react';
import { useConnections } from '../hooks/useConnections';
import { useMessages } from '../hooks/useMessages';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ConnectionCard } from './connections/ConnectionCard';
import { CreateOutOfBandInvitation } from './connections/CreateOutOfBandInvitation';
import { RecieveOutOfBandInvitation } from './connections/RecieveOutOfBandInvitaion';
import {ChatPanel} from "./connections/ChatPanel"

export const ConnectionsList = () => {
  const { data: connections = [], isLoading, error } = useConnections();
  const { data: messages = [], isLoading: isLoadingMessages, error: messagesError } = useMessages<any[]>();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleConnectionClick = (connection: any) => {
    setSelectedConnection(connection);
  };

  

  const handleCloseChat = () => {
    setSelectedConnection(null);
  };

  if (isLoading || isLoadingMessages) {
    return <div>Loading connections...</div>;
  }

  if (error) {
    return <div>Error loading connections: {error.message}</div>;
  }

  if(messagesError) {
    return <div>Error loading messages: {messagesError.message}</div>;
  }

  console.log(messages);
  
  return (
    <div className="relative flex">
      <div className={`flex-1 ${selectedConnection ? 'mr-1/3' : ''} space-y-4`}>
        <h2 className="text-2xl font-bold">Connections</h2>
        <button
          onClick={toggleCollapse}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center justify-center space-x-2"
        >
          {isCollapsed ? 'Hide New Connections'  : 'Manage New Connections'}
          {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <CreateOutOfBandInvitation />
            <RecieveOutOfBandInvitation />
          </div>
        )}

        <div className="grid gap-4">
          {connections.map((connection: any) => {
            const messageCount = messages.filter((message: any) => message.connection_id === connection.connection_id).length;
            return (
              <div key={connection.connection_id} >
                <ConnectionCard 
                  key={connection.connection_id}
                  connection={connection} 
                  messageCount={messageCount} 
                  onChatClick={handleConnectionClick}
                />
              </div>
            );
          })}
        </div>
      </div>

      {selectedConnection && (
        <div className='w-1/3'>
          <ChatPanel 
            connection={selectedConnection} 
            messages={messages.filter((message: any) => message.connection_id === selectedConnection.connection_id)} 
            onClose={handleCloseChat}
            />
        </div>
      )}
      
    </div>
  );
};