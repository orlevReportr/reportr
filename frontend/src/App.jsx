import { useState } from "react";
import "./App.css";
import Meetings from "./view/pages/Meetings/Meetings";
import Meeting from "./view/pages/Meeting/Meeting";
import Audio from "./view/pages/Audio/Audio";

import Login from "./view/pages/Login/Login";
import Register from "./view/pages/Register/Register";

import { Route, Routes } from "react-router-dom";
import Audios from "./view/pages/Audios/Audios";
import Dashboard from "./view/pages/Dashboard/Dashboard";
import Chatting from "./view/pages/Chatting/Chatting";
import ClientRecords from "./view/pages/ClientRecords/ClientRecords";

function App() {
  return (
    <div className="App h-full">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/client-records" element={<ClientRecords />} />

        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/meetings"
          element={<Meetings selectedItem="meetings" />}
        />
        <Route path="/meeting/:meetingId" element={<Meeting />} />
        <Route path="/audios" element={<Audios selectedItem="audios" />} />
        <Route path="/audio/:audioId" element={<Audio />} />
        <Route path="/chat" element={<Chatting />} />
      </Routes>
    </div>
  );
}

export default App;
