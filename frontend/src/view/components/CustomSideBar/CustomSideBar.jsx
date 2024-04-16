import React from 'react'
import "./CustomSideBar.css"
import {useNavigate} from "react-router-dom"
function CustomSideBar({selectedItem,drawer}) {
    const navigate=useNavigate();
  return (
    <div className={`custom-sidebar ${drawer ? 'sidebar-open' : ''}`}>
        <div style={{margin:16}}>
        <img src='../assets/logo.png' width={50} style={{borderRadius:10}}>
      </img>
        </div>
      <br></br>
      <div onClick={()=>{
        navigate("/")
      }} style={{margin:15}}>
        <span style={{color:selectedItem=="dashboard"?"rgba(255, 255, 255, 0.85)":"#909090"}} className='menu-item'>
            Dashboard
        </span>
      </div>
      <div onClick={()=>{
        navigate("/meetings")
      }} style={{margin:15}}>
        <span style={{color:selectedItem=="meetings"?"rgba(255, 255, 255, 0.85)":"#909090"}} className='menu-item'>
            Meetings
        </span>
      </div>
      <div onClick={()=>{
        navigate("/audios")
      }} style={{margin:15}}>
        <span style={{color:selectedItem=="audios"?"rgba(255, 255, 255, 0.85)":"#909090"}} className='menu-item'>
            Audios
        </span>
      </div>
    </div>
  )
}

export default CustomSideBar
