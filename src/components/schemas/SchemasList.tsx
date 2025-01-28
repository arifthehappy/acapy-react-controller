import React,{useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import { schemas } from '../../api/agent';
import { CreateSchema } from './CreateSchema';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const SchemasList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['schemas'],
    queryFn: () => schemas.getCreated()
  });

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) return <div>Loading schemas...</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={toggleCollapse}
        className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center justify-between"
      >
        {isCollapsed ? 'Create New Schema' : 'Hide New Schema'}
         {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}     
      </button>
       {!isCollapsed && <CreateSchema />}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Created Schemas</h3>
        <div className="space-y-4">
          {data?.data.schema_ids?.map((schemaId: string) => (
            <div key={schemaId} className="p-4 bg-gray-50 rounded">
              <p className="font-medium">{schemaId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};