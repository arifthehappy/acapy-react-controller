import React, { useState } from 'react';
import { useQuery} from '@tanstack/react-query';
import { credentialDefinitions } from '../../api/agent';
import { CreateCredentialDefinition } from './createCredentialDefinition';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';

export const CredentialDefinitionsList = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['credentialDefinitions'],
    queryFn: () => credentialDefinitions.getCreated()
  });

//   console.log(data);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="text-red-700">Error loading credential definitions: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Credential Definitions</h2>
        <button
          onClick={toggleCollapse}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>{isCollapsed ? 'Create New Definition' : 'Hide Form'}</span>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {!isCollapsed && <CreateCredentialDefinition />}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <Database size={24} className="text-indigo-600" />
          <h3 className="text-lg font-semibold">Created Definitions created</h3>
        </div>
        
        {data?.data.credential_definition_ids?.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No credential definitions found
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data.credential_definition_ids?.map((credDefId: string) => (
              <div key={credDefId} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="break-all">
                    <p className="font-medium text-gray-900">{credDefId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};