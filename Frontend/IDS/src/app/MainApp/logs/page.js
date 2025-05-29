'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  

  const fetchLogsData = async () => {
    try {
      const token = localStorage.getItem("token")
    const req = await axios.post("http://localhost:8000/logs_alert_statistic",{
      token_id : token
    });
    const data = req?.data;
    setLogs(data);
    setLoading(false); 
  }catch (err) {
      setError('Failed to fetch logs')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogsData()
  }, [])

  if (loading) return <div className="text-gray-700 p-6 text-lg">Loading logs...</div>
  if (error) return <div className="text-red-600 p-6">{error}</div>

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📜 System Logs</h1>

        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🕒 Recent Activity</h2>

          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log,idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow transition"
                >
                  <div>
                    <p className="text-gray-800 text-base font-medium">{log.message}</p>
                    <p className="text-sm text-gray-500">{log.timestamp}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      log.type === 'INFO'
                        ? 'bg-blue-100 text-blue-700'
                        : log.type === 'WARNING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No logs available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logs
