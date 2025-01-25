import React, { useState } from 'react';
import { SCHEMA_EMPLOYEE_DEFAULTS, SCHEMA_PERMISSION_DEFAULTS } from '../../config/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schemas } from '../../api/agent';
import { Plus, Trash } from 'lucide-react';
import './CreateSchema.css'; // Create a CSS file for custom styles

export const CreateSchema = () => {
  const [selectedDefault, setSelectedDefault] = useState('employee');
  const [name, setName] = useState(SCHEMA_EMPLOYEE_DEFAULTS.name);
  const [version, setVersion] = useState(SCHEMA_EMPLOYEE_DEFAULTS.version);
  const [attributes, setAttributes] = useState<string[]>(SCHEMA_EMPLOYEE_DEFAULTS.attributes);
  const queryClient = useQueryClient();

  const handleDefaultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedDefault(selected);
    if (selected === 'employee') {
      setName(SCHEMA_EMPLOYEE_DEFAULTS.name);
      setVersion(SCHEMA_EMPLOYEE_DEFAULTS.version);
      setAttributes(SCHEMA_EMPLOYEE_DEFAULTS.attributes);
    } else if (selected === 'permission') {
      setName(SCHEMA_PERMISSION_DEFAULTS.name);
      setVersion(SCHEMA_PERMISSION_DEFAULTS.version);
      setAttributes(SCHEMA_PERMISSION_DEFAULTS.attributes);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => schemas.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
      setName('');
      setVersion(SCHEMA_EMPLOYEE_DEFAULTS.version);
      setAttributes(SCHEMA_EMPLOYEE_DEFAULTS.attributes);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      schema_name: name,
      schema_version: version,
      attributes: attributes
    });
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, '']);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = value;
    setAttributes(newAttributes);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
       <div className="form-group">
        <label className="label">Select Default:</label>
        <select className="input" value={selectedDefault} onChange={handleDefaultChange}>
          <option value="employee">Employee Credential</option>
          <option value="permission">Permission Credential</option>
        </select>
      </div>
      <div className="form-group">
        <label className="label">Schema Name:</label>
        <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="label">Schema Version:</label>
        <input className="input" type="text" value={version} onChange={(e) => setVersion(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="label">Attributes:</label>
        {attributes.map((attribute, index) => (
          <div key={index} className="attribute-group">
            <input
              className="input"
              type="text"
              value={attribute}
              onChange={(e) => handleAttributeChange(index, e.target.value)}
            />
            <button className="button remove-button" type="button" onClick={() => handleRemoveAttribute(index)}>
              <Trash size={16} />
            </button>
          </div>
        ))}
        <button className="button add-button" type="button" onClick={handleAddAttribute}>
          <Plus size={16} /> Add Attribute
        </button>
      </div>
      <button className="button submit-button" type="submit">Create Schema</button>
    </form>
  );
};