import React from "react";
import { useNavigate } from "react-router-dom";

function TopNavBar() {
  const activeTab = window.location.pathname;
  console.log(activeTab);

  const navigate = useNavigate();
  return (
    <div className="flex gap-[10px] items-center py-[10px] px-[50px]">
      <span
        className="text-[16px] font-bold"
        onClick={() => {
          navigate("/");
        }}
      >
        Reportr AI
      </span>
      <div
        style={{
          borderBottom: activeTab === "/consult" ? "2px solid #383838" : "none",
        }}
        onClick={() => {
          navigate("/consult");
        }}
      >
        <div className="cursor-pointer hover:bg-[#cbcbcb] hover:text-opacity-70 h-full rounded p-[5px]">
          <span className="text-[14px]">Consult</span>
        </div>
      </div>
      <div
        onClick={() => {
          navigate("/client-records");
        }}
        style={{
          borderBottom:
            activeTab === "/client-records" ? "2px solid #383838" : "none",
        }}
      >
        <div className="cursor-pointer hover:bg-[#cbcbcb] hover:text-opacity-70 h-full rounded p-[5px]">
          <span className="text-[14px]">Client Records</span>
        </div>
      </div>
      <div
        onClick={() => {
          navigate("/customize");
        }}
        style={{
          borderBottom:
            activeTab === "/customize" ? "2px solid #383838" : "none",
        }}
      >
        <div className="cursor-pointer hover:bg-[#cbcbcb] hover:text-opacity-70 h-full rounded p-[5px]">
          <span className="text-[14px]">Customise</span>
        </div>
      </div>
      <div
        onClick={() => {
          navigate("/settings");
        }}
        style={{
          borderBottom:
            activeTab === "/settings" ? "2px solid #383838" : "none",
        }}
      >
        <div className="cursor-pointer hover:bg-[#cbcbcb] hover:text-opacity-70 h-full rounded p-[5px]">
          <span className="text-[14px]">Settings</span>{" "}
        </div>
      </div>
    </div>
  );
}

export default TopNavBar;
