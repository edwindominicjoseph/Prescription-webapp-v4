import { useState } from 'react';

export default function UserPage() {
  const [preferences, setPreferences] = useState({
    email: true,
    push: false,
    digest: true,
    reminders: false,
  });

  const toggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-violet-200 px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="col-span-1 text-center md:text-left">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400">📷</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">EDWIN</h2>
            <p className="text-sm text-gray-600">jEDWIN@gmail.com</p>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <p><strong>Account Type:</strong> Pro User</p>
              <p><strong>Member Since:</strong> January 2023</p>
            </div>
            <div className="mt-6 space-y-2">
              <button className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800">Edit Profile</button>
              <button className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400">Logout</button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Activity Log</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>Profile Updated</span><span className="text-gray-500">2 weeks ago</span>
              </li>
              <li className="flex justify-between">
                <span>Payment Method Added</span><span className="text-gray-500">2 weeks ago</span>
              </li>
              <li className="flex justify-between">
                <span>Plan Upgraded to Pro</span><span className="text-gray-500">2 weeks ago</span>
              </li>
            </ul>
          </div>

          {/* Preferences */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Preferences</h3>
            <div className="space-y-4 text-sm text-gray-700">
              {[
                ['Email Notifications', 'email'],
                ['Push Notifications', 'push'],
                ['Weekly Digest', 'digest'],
                ['Reminders', 'reminders'],
              ].map(([label, key]) => (
                <div key={key} className="flex justify-between items-center">
                  <span>{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={() => toggle(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-500 transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-5 transition"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
