import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Key, FileCheck, Shield } from 'lucide-react';

export const Navigation = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">ACA-Py Controller</div>
        <div className="flex space-x-6">
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
        </div>
      </div>
    </nav>
  );
};