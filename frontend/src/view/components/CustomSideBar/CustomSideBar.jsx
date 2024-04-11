import React from 'react'
import "./CustomSideBar.css"
import {useNavigate} from "react-router-dom"
function CustomSideBar({selectedItem}) {
    const navigate=useNavigate();
  return (
    <div style={{width:"25%",height:"100vh",display:"flex",flexDirection:"column",alignItems:"start",position:"relative"}} className='custom-sidebar'>
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

    </div>
  )
}

export default CustomSideBar
