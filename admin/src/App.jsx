import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, RefreshCw, Moon, Sun } from 'lucide-react';

function App() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchMachines() {
    try {
      const res = await fetch('http://localhost:5000/api/machines');
      const data = await res.json();
      setMachines(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">🖥️ System Health Dashboard</h1>
          <button
            onClick={fetchMachines}
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </header>

        {loading ? (
          <div className="text-center text-lg text-gray-600">Loading data...</div>
        ) : (
          <div className="overflow-x-auto shadow ring-1 ring-gray-200 rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Machine ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">OS</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Disk Encryption</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">OS Update</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Antivirus</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sleep Timeout</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {machines.map((m) => {
                  const isSecure = m.disk_encrypted && m.os_update_status === "Updated" && m.antivirus_active;

                  return (
                    <tr
                      key={m.machine_id}
                      className={`hover:bg-gray-50 transition ${
                        !isSecure ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{m.machine_id}</td>
                      <td className="px-4 py-3 text-gray-700">{m.os}</td>
                      <td className="px-4 py-3">
                        {m.disk_encrypted ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                            <ShieldCheck size={14} className="mr-1" /> Encrypted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                            <ShieldOff size={14} className="mr-1" /> Not Encrypted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {m.os_update_status === "Updated" ? (
                          <span className="text-green-600 font-medium">Updated</span>
                        ) : (
                          <span className="text-red-600 font-medium">Outdated</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {m.antivirus_active ? (
                          <span className="text-green-600 font-medium">Active</span>
                        ) : (
                          <span className="text-red-600 font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{(m.sleep_timeout_seconds / 60).toFixed(0)} min</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(m.timestamp || m.last_update).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
