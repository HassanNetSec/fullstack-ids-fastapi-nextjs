'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Statistic = () => {
  const [mockData, setMockData] = useState({});

  // Dummy protocol distribution data
  const protocolDistribution = [
    { protocol: 'TCP', count: 4200 },
    { protocol: 'UDP', count: 1830 },
    { protocol: 'ICMP', count: 950 },
    { protocol: 'HTTP', count: 1200 },
    { protocol: 'HTTPS', count: 980 },
    { protocol: 'DNS', count: 640 }
  ];

  // Dummy attack trends data
  const attackTrends = [
    { time: '00:00', synScans: 10, ddos: 2 },
    { time: '03:00', synScans: 15, ddos: 3 },
    { time: '06:00', synScans: 30, ddos: 6 },
    { time: '09:00', synScans: 45, ddos: 10 },
    { time: '12:00', synScans: 60, ddos: 20 },
    { time: '15:00', synScans: 55, ddos: 18 },
    { time: '18:00', synScans: 35, ddos: 7 },
    { time: '21:00', synScans: 25, ddos: 4 },
  ];

  useEffect(() => {
    const fetch_data_statistic = async () => {
      try {
        const token = localStorage.getItem("token")
        const req = await axios.post("http://localhost:8000/statistic",{
          token_id : token
        });
        setMockData({
          suspicious_ips: req?.data?.suspicious_ips || [],
          ddos_attempts_last_24h: req?.data?.ddos_attempts_last_24h || 0,
          syn_scans_last_24h: req?.data?.syn_scans_last_24h || 0,
          total_packets: req?.data?.total_packets || 0
        });
        console.log("ip: ",req?.data?.suspicious_ips);
        
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    
    fetch_data_statistic();
  }, []);

  if (!mockData.suspicious_ips) return <div className="text-gray-800 p-4">Loading stats...</div>;

  return (
    <div className="p-6 min-h-screen bg-white text-gray-800 space-y-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📊 Network Statistics</h1>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Packets" value={mockData.total_packets} color="text-blue-600" />
        <StatCard title="SYN Scans" value={mockData.syn_scans_last_24h} color="text-yellow-600" />
        <StatCard title="DDoS Attempts" value={mockData.ddos_attempts_last_24h} color="text-red-600" />
      </div>

      {/* Suspicious IPs */}
      <div className="bg-gray-100 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">🔍 Suspicious IPs</h2>
        <ul className="divide-y divide-gray-300">
          {mockData.suspicious_ips.map((ip, index) => (
            <li key={index} className="flex justify-between py-2 text-sm">
              <span className="font-mono">{ip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Attack Trends (dummy data) */}
      <div className="bg-gray-100 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">📈 Attack Trends</h2>
        <div className="grid grid-cols-3 font-semibold text-gray-500 border-b border-gray-300 pb-2 mb-2 text-sm">
          <span>Time</span><span>SYN Scans</span><span>DDoS</span>
        </div>
        {attackTrends.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 text-sm py-2 border-b border-gray-200">
            <span>{item.time}</span>
            <span>{item.synScans}</span>
            <span>{item.ddos}</span>
          </div>
        ))}
      </div>

      {/* Protocol Distribution (dummy data) */}
      <div className="bg-gray-100 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">🌐 Protocol Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {protocolDistribution.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center"
            >
              <span className="text-lg font-semibold">{item.protocol}</span>
              <span className="text-2xl font-bold text-blue-600">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Reusable stat card
const StatCard = ({ title, value, color }) => (
  <div className="bg-gray-100 p-6 rounded-2xl shadow text-center">
    <h2 className="text-lg font-medium text-gray-600 mb-2">{title}</h2>
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
  </div>
)

export default Statistic
