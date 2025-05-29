'use client'
import axios from 'axios'
import React, { useState, useEffect } from 'react'

const Alert = () => {
  const [alertType, setAlertType] = useState('all')
  const [alerts, setAlerts] = useState([])
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [eventSource, setEventSource] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInitialAlerts = async () => {
      try {
        const token = localStorage.getItem('token')
        // Initialize alerts
        await axios.post("http://localhost:8000/capture_packet", {
          token_id: token,
        })
        
        // Get existing alerts from database
        const response = await axios.post("http://localhost:8000/alert_database")
        console.log("Database response:", response.data)
        setAlerts(response.data || [])
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialAlerts()

    // Initialize EventSource for real-time updates
    const newEventSource = new EventSource("http://localhost:8000/stream_alert")
    
    newEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setAlerts(prev => {
        // Prevent duplicates by checking if alert already exists
        const exists = prev.some(alert => 
          alert.created_at === data.created_at && 
          alert.description === data.description
        )
        return exists ? prev : [...prev, data]
      })
    }

    newEventSource.onerror = (error) => {
      console.error("EventSource error:", error)
      newEventSource.close()
    }

    setEventSource(newEventSource)

    return () => {
      newEventSource.close()
    }
  }, [])

  useEffect(() => {
    if (alertType === 'all') {
      setFilteredAlerts(alerts)
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.alert_type === alertType))
    }
  }, [alertType, alerts])

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now"
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getSeverityColor = (severity) => {
    if (!severity) return 'bg-gray-100 border-gray-400 text-gray-800'
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 border-red-500 text-red-800'
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800'
      default: return 'bg-gray-100 border-gray-400 text-gray-800'
    }
  }

  const getSeverityBadgeStyle = (severity) => {
    if (!severity) return 'bg-gray-600 text-white'
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-600 text-white'
      case 'medium': return 'bg-yellow-600 text-white'
      case 'low': return 'bg-blue-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Security Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Live monitoring of potential network threats</p>
        </div>
        <select
          onChange={(e) => setAlertType(e.target.value)}
          className="bg-white text-gray-800 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          defaultValue="all"
        >
          <option value="all">All Alerts</option>
          <option value="SYN Flood">SYN Flood</option>
          <option value="ARP Spoofing">ARP Spoofing</option>
          <option value="Port Scan">Port Scan</option>
          <option value="DDoS Attempt">DDoS Attempt</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div
              key={`${alert.created_at}-${index}`}
              className={`p-6 border-l-4 rounded-2xl shadow-md hover:shadow-xl transition duration-200 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between flex-col sm:flex-row sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg sm:text-xl font-semibold">{alert.alert_type}</h2>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getSeverityBadgeStyle(alert.severity)}`}>
                      {alert.severity?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {alert.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    {alert.packet_id && `Packet ID: ${alert.packet_id}`}
                    {alert.user_email && ` • Reported by: ${alert.user_email}`}
                  </div>
                </div>

                <span className="text-sm text-gray-500 whitespace-nowrap self-start sm:self-center">
                  {formatTimestamp(alert.created_at)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            {alerts.length === 0 
              ? "No alerts found in the system." 
              : "No alerts found for the selected type."}
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert