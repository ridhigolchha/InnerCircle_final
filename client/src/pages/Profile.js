import React from 'react';
import { User, Settings, Shield } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <div className="card text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Management</h2>
        <p className="text-gray-600 mb-4">Coming soon - Update your profile and account settings</p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Personal Info</p>
          </div>
          <div className="text-center">
            <Settings className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Settings</p>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Privacy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
