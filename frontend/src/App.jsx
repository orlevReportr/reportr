import { useState } from 'react'
import './App.css'
import Meetings from './view/pages/Meetings/Meetings'
import Meeting from './view/pages/Meeting/Meeting'
import Audio from './view/pages/Audio/Audio'

import Login from './view/pages/Login/Login'
import Register from './view/pages/Register/Register'

import { Route,Routes } from 'react-router-dom';
import Audios from './view/pages/Audios/Audios'
import Dashboard from './view/pages/Dashboard/Dashboard'
import Chatting from './view/pages/Chatting/Chatting'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
   
<Routes >
<Route path= "/" element ={<Dashboard/>}  />

  <Route path= "/signup" element ={<Register/>}  />
  <Route path= "/login" element ={<Login/>}  />
  <Route path= "/meetings" element ={<Meetings selectedItem="meetings"/>}  />
  <Route path= "/meeting/:meetingId" element ={<Meeting/>}  />
  <Route path= "/audios" element ={<Audios selectedItem="audios"/>}  />
  <Route path= "/audio/:audioId" element ={<Audio/>}  />
  <Route path= "/chat" element ={<Chatting/>}  />



</Routes>
    
    </div>
  )
}

export default App
