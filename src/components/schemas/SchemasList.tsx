import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schemas } from '../../api/agent';
import { CreateSchema } from './CreateSchema';

export const SchemasList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['schemas'],
    queryFn: () => schemas.getCreated()
  });

  if (isLoading) return <div>Loading schemas...</div>;

  return (
    <div className="space-y-6">
      <CreateSchema />
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