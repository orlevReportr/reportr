import React, { useEffect } from 'react'
import { UserData } from '../../../utils/UserData'
import {useNavigate} from "react-router-dom"
import CustomSideBar from '../../components/CustomSideBar/CustomSideBar';
function Homepage({selectedItem}) {
  const userData=UserData();
const navigate=useNavigate();
  useEffect(() => {
    if(!userData){
      navigate("/login");
    }
  },[])
  return (
    <div style={{display:"flex",width:"100%",flexDirection:"row"}}>
      <CustomSideBar selectedItem="dashboard"/>
      <div style={{width:"80%"}}>
        dazd
      </div>
    </div>
  )
}

export default Homepage
