import React from 'react';
import { User, Shield, Bell } from 'lucide-react';

export const SettingsView = () => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
                <div className="bg-teal-50 p-3 rounded-full mr-4">
                    <User className="text-teal-600" size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Profile Information</h3>
                    <p className="text-sm text-slate-500">Manage your personal health profile</p>
                </div>
            </div>
            <button className="text-teal-600 font-medium hover:underline">Edit</button>
        </div>

        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
                <div className="bg-teal-50 p-3 rounded-full mr-4">
                    <Shield className="text-teal-600" size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Privacy & Data</h3>
                    <p className="text-sm text-slate-500">Control how your data is stored</p>
                </div>
            </div>
            <button className="text-teal-600 font-medium hover:underline">Manage</button>
        </div>
        
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
                <div className="bg-teal-50 p-3 rounded-full mr-4">
                    <Bell className="text-teal-600" size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                    <p className="text-sm text-slate-500">Medication reminders and alerts</p>
                </div>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-4 checked:border-teal-600"/>
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-teal-600"></label>
            </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">About Medico Assistant</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
            Medico Assistant uses advanced AI to help you understand your health data. 
            However, it is not a substitute for professional medical advice. 
            Always consult with a qualified healthcare provider for diagnosis and treatment.
        </p>
      </div>
    </div>
  );
}