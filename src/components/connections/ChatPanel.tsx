import React, { useState } from 'react';
import { XCircle} from 'lucide-react'; //close button icon
interface ChatPanelProps {
  connection: any;
  messages: any[];
  onClose: () => void;
}

export const ChatPanel = ({ connection, messages, onClose }: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    // Implement the logic to send a new message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed right-2 h-full bg-white shadow-lg p-4 overflow-y-auto border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{connection.their_label || 'Unknown'}</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <XCircle size={20} />
        </button>
      </div>
      <div className="flex flex-col space-y-2 mb-4">
        {messages.map((message, index) => (
          <div key={index} className="bg-gray-100 p-2 rounded">
            <p className="text-sm text-gray-600">{message.content}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};