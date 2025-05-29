"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const PacketCapturePage = () => {
  const [packets, setPackets] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [eventSource, setEventSource] = useState(null); // <-- important: manage eventSource globally

  useEffect(() => {
    const token = localStorage.getItem("token");

    const startCapture = async () => {
      try {
        if (!isPaused) {
          // Send request to backend to start capturing
          await axios.post("http://localhost:8000/capture_packet", {
            token_id: token,
          });

          // Only create event source if not already created
          if (!eventSource) {
            const newEventSource = new EventSource("http://localhost:8000/stream");

            newEventSource.onmessage = (event) => {
              const data = JSON.parse(event.data);
              setPackets((prev) => [...prev, data]);
            };

            newEventSource.onerror = (error) => {
              console.error("EventSource error:", error);
              newEventSource.close();
              setEventSource(null); // reset if error
            };

            setEventSource(newEventSource);
          }
        } else {
          // If paused, close the stream
          if (eventSource) {
            eventSource.close();
            setEventSource(null);
          }
        }
      } catch (error) {
        console.error("Error in packet capture:", error);
      }
    };

    startCapture();

    return () => {
      // Cleanup when component unmounts
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [isPaused]); // depends on isPaused

  const getProtocolName = (protocol) => {
    if (protocol === 1) return "ICMP";
    if (protocol === 6) return "TCP";
    if (protocol === 17) return "UDP";
    return "Other";
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Live Packet Capture</h1>
          <div className="space-x-3">
            {isPaused ? (
              <button
                onClick={handleResume}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg shadow transition"
              >
                ▶ Resume
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-5 py-2 rounded-lg shadow transition"
              >
                ⏸ Pause
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4 text-left">🌐 Source IP</th>
                <th className="p-4 text-left">🎯 Destination IP</th>
                <th className="p-4 text-left">📡 Protocol</th>
                <th className="p-4 text-left">🚩 Length</th>
                <th className="p-4 text-left">🚩 Summary</th>
                <th className="p-4 text-left">🕒 Flags</th>
              </tr>
            </thead>
            <tbody>
              {packets.map((packet, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                >
                  <td className="p-4 font-mono">{packet.source}</td>
                  <td className="p-4 font-mono">{packet.destination}</td>
                  <td className="p-4">{getProtocolName(packet.protocol)}</td>
                  <td className="p-4">{packet.length || "-"}</td>
                  <td className="p-4">{packet.flags}</td>
                  <td className="p-4">{packet.summary || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PacketCapturePage;
