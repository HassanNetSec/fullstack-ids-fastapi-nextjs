import React from "react";
import Sidebar from "@/app/(Style)/Sidebar"; // Adjust the path as necessary

const MainAppLayout = ({ children }) => {
  return (
    <div className="flex max-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {children} {/* This will render the specific page content inside MainApp */}
      </div>
    </div>
  );
};

export default MainAppLayout;
