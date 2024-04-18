import React from 'react'
import "./CustomSideBar.css"
import {useNavigate} from "react-router-dom"

import { AudioOutlined,WechatOutlined,HomeOutlined} from "@ant-design/icons";

function CustomSideBar({selectedItem,drawer}) {
    const navigate=useNavigate();
  return (
    <div className={`custom-sidebar ${drawer ? 'sidebar-open' : ''}`}>
        <div style={{margin:16}}>
        <img src='../assets/logo.png' width={150} style={{borderRadius:10}}>
      </img>
        </div>
      <br></br>
      <div onClick={()=>{
        navigate("/")
      }} className={`menu-item-container ${selectedItem === "dashboard" ? 'selected' : ''}`}>
        <span>
        <HomeOutlined style={{marginRight:10}} />Dashboard
        </span>
      </div>
      <div onClick={()=>{
        navigate("/meetings")
      }} className={`menu-item-container ${selectedItem === "meetings" ? 'selected' : ''}`}>
        <span>
        <WechatOutlined style={{marginRight:10}}/>Online Meetings
        </span>
      </div>
      <div onClick={()=>{
        navigate("/audios")
      }} className={`menu-item-container ${selectedItem === "audios" ? 'selected' : ''}`}>
        <span>
        <AudioOutlined style={{marginRight:10}}/>Audios Meetings
        </span>
      </div>
    </div>
  )
}

export default CustomSideBar
