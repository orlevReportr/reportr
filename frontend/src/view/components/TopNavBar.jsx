import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import axiosRequest from "../../utils/AxiosConfig";

function TopNavBar() {
  const activeTab = window.location.pathname;

  const navigate = useNavigate();

  const handleLoginWithGoogle = async () => {
    const response = await axiosRequest.get("/oauth/login");
    const { url } = response.data;

    // Redirect the user to the Google consent screen
    window.location.href = url;
  };
  return (
    <div className="flex gap-[10px] items-center py-[10px] px-[50px] bg-[white]">
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
        <div className="duration-100 cursor-pointer hover:bg-[#dcdcdc] hover:text-opacity-70 h-full rounded p-[5px]">
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
        <div className="duration-100 cursor-pointer hover:bg-[#dcdcdc] hover:text-opacity-70 h-full rounded p-[5px]">
          <span className="text-[14px]">Client Records</span>
        </div>
      </div>
      <div
        onClick={() => {
          navigate("/customize/your-templates");
        }}
        style={{
          borderBottom:
            activeTab === "/customize/your-templates" ||
            activeTab === "/customize/reportr-ai-templates"
              ? "2px solid #383838"
              : "none",
        }}
      >
        <div className="duration-100 cursor-pointer hover:bg-[#dcdcdc] hover:text-opacity-70 h-full rounded p-[5px]">
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
        <div className="duration-100 cursor-pointer hover:bg-[#dcdcdc] hover:text-opacity-70 h-full rounded p-[5px]">
          <span className="text-[14px]">Settings</span>{" "}
        </div>
      </div>
      <button onClick={handleLoginWithGoogle}>Login with Google</button>
    </div>
  );
}

export default TopNavBar;
