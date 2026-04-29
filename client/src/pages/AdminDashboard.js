import React from 'react';
import { Shield, Users, TrendingUp, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the platform and view analytics</p>
        </div>
      </div>
      
      <div className="card text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Administrative Panel</h2>
        <p className="text-gray-600 mb-4">Coming soon - Access comprehensive analytics and management tools</p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">User Management</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Analytics</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
