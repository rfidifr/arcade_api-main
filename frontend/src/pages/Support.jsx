import React from 'react';
import { LifeBuoy, Mail, Phone, MessageSquare } from 'lucide-react';

const Support = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <LifeBuoy className="mr-2" /> Support Center
      </h2>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600 mb-8 text-lg">
          Facing an issue? Our support team is available 24/7 to assist you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="tel:+18001234567" className="block p-6 border border-gray-200 rounded-xl hover:border-blue-500 transition-colors text-center group cursor-pointer hover:shadow-md">
            <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-500 text-sm">+1 (800) 123-4567</p>
            <p className="text-gray-400 text-xs mt-1">Priority Support</p>
          </a>

          <a href="mailto:support@arcadesolutions.com" className="block p-6 border border-gray-200 rounded-xl hover:border-green-500 transition-colors text-center group cursor-pointer hover:shadow-md">
            <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-full mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Mail size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-500 text-sm">support@arcadesolutions.com</p>
            <p className="text-gray-400 text-xs mt-1">Response within 2 hours</p>
          </a>

          <div 
            onClick={() => alert('Connecting to a live agent... Please wait.')}
            className="p-6 border border-gray-200 rounded-xl hover:border-purple-500 transition-colors text-center group cursor-pointer hover:shadow-md"
          >
            <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-full mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-500 text-sm">Available on Dashboard</p>
            <p className="text-gray-400 text-xs mt-1">Instant connect</p>
          </div>
        </div>

        <div className="mt-10 bg-slate-50 p-6 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">Common Troubleshooting Steps</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
            <li>Check your internet connection if machines are showing OFFLINE.</li>
            <li>If RFID reader is not responding, try reconnecting the USB cable.</li>
            <li>Restart the browser if the dashboard feels sluggish.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Support;
