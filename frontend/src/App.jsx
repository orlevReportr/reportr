import { useState } from 'react'
import './App.css'
import Meetings from './view/pages/Meetings/Meetings'
import Meeting from './view/pages/Meeting/Meeting'
import Login from './view/pages/Login/Login'
import Register from './view/pages/Register/Register'

import { Route,Routes } from 'react-router-dom';
import Audios from './view/pages/Audios/Audios'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App" style={{}}>
   
<Routes >
  <Route path= "/" element ={<Audios selectedItem="audios"/>}  />
  <Route path= "/signup" element ={<Register/>}  />
  <Route path= "/login" element ={<Login/>}  />
  <Route path= "/meetings" element ={<Meetings selectedItem="meetings"/>}  />
  <Route path= "/meeting/:meetingId" element ={<Meeting/>}  />



</Routes>
    
    </div>
  )
}

export default App
