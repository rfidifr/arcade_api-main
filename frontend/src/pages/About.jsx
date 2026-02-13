import React from 'react';
import { Info, Building, ShieldCheck } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <Info className="mr-2" /> About System
      </h2>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Building size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Company Information</h3>
            <p className="text-gray-600 mt-1">
              Developed by <span className="font-semibold text-gray-800">Arcade Solutions Pvt Ltd.</span>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              We provide cutting-edge RFID management solutions for arcades, theme parks, and family entertainment centers.
              Our mission is to streamline operations and enhance guest experience.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex items-start space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Version Information</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium text-gray-700">Software Version:</span> v1.2.0 (Stable)</p>
              <p><span className="font-medium text-gray-700">Build Date:</span> February 2026</p>
              <p><span className="font-medium text-gray-700">License Status:</span> Active (Enterprise)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8">
        &copy; 2026 Arcade Solutions. All rights reserved.
      </div>
    </div>
  );
};

export default About;
