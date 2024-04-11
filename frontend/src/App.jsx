import { useState } from 'react'
import './App.css'
import Meetings from './view/pages/Meetings/Meetings'
import Meeting from './view/pages/Meeting/Meeting'
import Login from './view/pages/Login/Login'
import Register from './view/pages/Register/Register'
import Homepage from './view/pages/Homepage/Homepage'
import { Route,Routes } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App" style={{width:"100vw",height:"100vh"}}>
   
<Routes >
  <Route path= "/" element ={<Homepage selectedItem="dashboard"/>}  />
  <Route path= "/signup" element ={<Register/>}  />
  <Route path= "/login" element ={<Login/>}  />
  <Route path= "/meetings" element ={<Meetings selectedItem="meetings"/>}  />
  <Route path= "/meeting/:meetingId" element ={<Meeting/>}  />



</Routes>
    
    </div>
  )
}

export default App
