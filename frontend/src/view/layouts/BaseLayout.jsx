import React from "react";
import TopNavBar from "../components/TopNavBar";

function BaseLayout({ children }) {
  return (
    <div className="flex flex-col h-full justify-start">
      <TopNavBar />
      {children}
    </div>
  );
}

export default BaseLayout;
