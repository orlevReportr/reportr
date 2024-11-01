import { useEffect, useState } from "react";
import "./App.css";
import ClientRecords from "./view/pages/ClientRecords/ClientRecords";
import Audio from "./view/pages/Audio/Audio";

import Login from "./view/pages/Login/Login";
import Register from "./view/pages/Register/Register";

import { Route, Routes } from "react-router-dom";
import Audios from "./view/pages/Audios/Audios";
import Dashboard from "./view/pages/Dashboard/Dashboard";
import Chatting from "./view/pages/Chatting/Chatting";
import Meeting from "./view/pages/Meeting/Meeting";
import Meetings from "./view/pages/Meetings/Meetings";
import Consult from "./view/pages/Consult/Consult";
import YourTemplates from "./view/pages/Customize/YourTemplates/YourTemplates";
import OAuthCallback from "./view/pages/Callback";
import ConsultMeeting from "./view/pages/ConsultMeeting/ConsultMeeting";
import ReportrAITemplates from "./view/pages/Customize/ReporterAITemplates/ReportrAITemplates";
import { UserData } from "./utils/UserData";

function App() {
  const userData = UserData();
  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
  }, [userData]);
  return (
    <div className="App h-full">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client-records" element={<ClientRecords />} />
        <Route path="/consult" element={<Consult />} />
        <Route
          path="/customize/reportr-ai-templates"
          element={<ReportrAITemplates />}
        />
        <Route path="/customize/your-templates" element={<YourTemplates />} />
        <Route
          path="/client-records/:clientRecordId"
          element={<ConsultMeeting />}
        />

        <Route path="/settings" element={<ClientRecords />} />

        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<OAuthCallback />} />
        {/* <Route path="/meetings" element={<Meetings />} />
        <Route path="/clientrecord/:clientRecordId" element={<Meeting />} />
        <Route path="/audios" element={<Audios selectedItem="audios" />} />
        <Route path="/audio/:audioId" element={<Audio />} />
        <Route path="/chat" element={<Chatting />} /> */}
      </Routes>
    </div>
  );
}

export default App;
