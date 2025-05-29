"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState(null); // Store email instead of token
  const [dashboardData, setDashboardData] = useState(null); // Store dashboard data
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const router = useRouter();

  // Fake data for the Dashboard stats (replace with real API calls later)
  const fakeDashboardData = {
    totalAlerts: 238, 
    scannedPorts: 159, 
    ddosAttempts: 72,
    activeSessions: 14,
    blockedAttacks: 38,
    systemUptime: "72 hours",
    recentAttacks: [
      { id: 1, ip: "192.168.1.100", type: "SYN Scan", time: "5 mins ago" },
      { id: 2, ip: "192.168.1.102", type: "Xmas Scan", time: "30 mins ago" },
      { id: 3, ip: "192.168.1.110", type: "DDoS Attempt", time: "1 hour ago" },
    ],
  };

  // Fetch token from localStorage and validate it
  const token_get_from_localStorage = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("You need to log in first!");
      router.push("/login");
      return;
    }

    try {
      // Send the token to the backend
      const response = await axios.post("http://localhost:8000/protected", {
        token_id: storedToken, // Sending token to the backend
      });

      setUserEmail(response.data); // Set the user email after successful validation
      fetchDashboardData(); // Fetch dashboard data after successful validation
    } catch (error) {
      alert("Unauthorized! Please log in again.");
      localStorage.removeItem("token"); // Clear invalid token
      router.push("/login");
    }
  };

  // Simulate fetching data and setting fake data
  const fetchDashboardData = async () => {
    setLoading(true); // Set loading state before fetching data
    setTimeout(() => {
      setDashboardData(fakeDashboardData); // Setting fake data
      setLoading(false); // Set loading state to false after data fetch
    }, 2000); // Simulating an API call delay
  };

  // Component did mount equivalent
  useEffect(() => {
    token_get_from_localStorage();
  }, []); // Runs once on component mount

  return (
    <div className="flex flex-grow p-8 bg-gray-50">
    {/* Main Content */}
    <div className="flex-1 p-8 bg-white">
      <h1 className="text-4xl font-semibold text-gray-800 mb-8">Dashboard</h1>
  
      {/* User Info */}
      <div className="p-6 bg-gray-100 border-l-4 border-blue-500 mb-8">
        {userEmail ? (
          <p className="text-xl text-gray-700">Logged in as: <strong>{userEmail}</strong></p>
        ) : (
          <p className="text-xl text-gray-500">No user email found</p>
        )}
      </div>
  
      {/* Dashboard Stats */}
      {loading ? (
        <div className="text-center text-xl text-gray-500">Loading dashboard data...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Total Alerts */}
          <div className="bg-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Total Alerts</h3>
            <p className="text-5xl font-bold text-gray-700">{dashboardData?.totalAlerts}</p>
          </div>
  
          {/* Total Scanned Ports */}
          <div className="bg-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Total Scanned Ports</h3>
            <p className="text-5xl font-bold text-gray-700">{dashboardData?.scannedPorts}</p>
          </div>
  
          {/* Total DDoS Attempts */}
          <div className="bg-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Total DDoS Attempts</h3>
            <p className="text-5xl font-bold text-gray-700">{dashboardData?.ddosAttempts}</p>
          </div>
        </div>
      )}
  
      {/* Recent Attacks */}
      <div className="bg-white p-8 mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recent Attacks</h3>
        <div className="space-y-6">
          {dashboardData?.recentAttacks && dashboardData.recentAttacks.length > 0 ? (
            dashboardData.recentAttacks.map((attack) => (
              <div key={attack.id} className="p-6 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-xl font-semibold text-gray-800">{attack.type}</p>
                  <p className="text-sm text-gray-600">IP: {attack.ip}</p>
                </div>
                <p className="text-sm text-gray-500">{attack.time}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent attacks.</p>
          )}
        </div>
      </div>
  
      {/* System Uptime */}
      <div className="bg-white p-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">System Uptime</h3>
        <p className="text-5xl font-bold text-gray-700">{dashboardData?.systemUptime}</p>
      </div>
    </div>
  </div>
  
  
  );
};

export default Dashboard;
