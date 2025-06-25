import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    name: 'Edwin',
    email: 'edj@yahoo.com',
    emailNotif: true,
    pushNotif: false,
    twoFA: false,
  });

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black px-4 py-8">
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md space-y-8">

        {/* Profile Settings */}
        <section>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="text-sm text-gray-400 mb-4">Update your profile information.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full input-style"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full input-style"
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <p className="text-sm text-gray-400 mb-4">Update your password and manage your account’s security.</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-300">
              🔒 <span>Change password</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex gap-2 items-center text-sm text-gray-300">
                🛡 <span>Two-factor authentication</span>
              </div>
              <ToggleSwitch value={settings.twoFA} onToggle={() => toggle('twoFA')} />
            </li>
          </ul>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <p className="text-sm text-gray-400 mb-4">Choose how you want to be notified.</p>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex justify-between items-center">
              <span>Email notifications</span>
              <ToggleSwitch value={settings.emailNotif} onToggle={() => toggle('emailNotif')} />
            </div>
            <div className="flex justify-between items-center">
              <span>Push notifications</span>
              <ToggleSwitch value={settings.pushNotif} onToggle={() => toggle('pushNotif')} />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-6 border-t">
          <button className="text-red-600 text-sm flex items-center gap-2 hover:underline">
            🗑 Delete account
          </button>
        </section>
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onToggle }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={value} onChange={onToggle} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-400 transition"></div>
      <div className="absolute left-1 top-1 w-4 h-4 bg-gray-200 rounded-full shadow-md transform peer-checked:translate-x-5 transition"></div>
    </label>
  );
}
