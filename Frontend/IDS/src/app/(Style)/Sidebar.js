"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser } from "react-icons/fa"; // Import the Profile icon from React Icons

const Sidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      name: "Dashboard",
      href: "/MainApp/dashboard",
      icon: "fa fa-tachometer-alt", // FontAwesome icon class
      color: "text-indigo-400",
    },
    {
      name: "Logs",
      href: "/MainApp/logs",
      icon: "fa fa-list", // FontAwesome icon class
      color: "text-green-400",
    },
    {
      name: "Alert",
      href: "/MainApp/alert",
      icon: "fa fa-cogs", // FontAwesome icon class
      color: "text-yellow-400",
    },
    {
      name: "Packet Capture",
      href: "/MainApp/packetCapture",
      icon: "fa fa-cogs", // FontAwesome icon class
      color: "text-yellow-400",
    },
    {
      name: "Statistic Page",
      href: "/MainApp/statistic",
      icon: "fa fa-cogs", // FontAwesome icon class
      color: "text-yellow-400",
    },
    {
      name: "Profile", // Add Profile link here
      href: "/MainApp/profile", // Profile link destination
      icon: <FaUser className="mr-3 w-5 text-blue-400" />, // Use the React Icon here
      color: "text-blue-400",
    },
  ];

  return (
    <div className="min-w-[16rem] md:w-64 bg-gray-900 text-white h-screen flex flex-col shadow-2xl border-r border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold text-center text-indigo-400 tracking-wide">
          IDS Dashboard
        </h2>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 p-6 space-y-4">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`flex items-center text-base font-medium px-4 py-2 rounded transition duration-200 ${
                pathname === link.href
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:bg-gray-800"
              }`}
            >
              {/* Render FontAwesome icons or React Icons */}
              {typeof link.icon === "string" ? (
                <i className={`${link.icon} mr-3 w-5 ${link.color}`}></i>
              ) : (
                link.icon // React Icon
              )}
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        <Link
          href="/logout"
          className="flex items-center justify-center text-base font-medium text-gray-400 hover:text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition duration-200"
        >
          <i className="fa fa-sign-out-alt mr-2 w-5"></i>
          Logout
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
