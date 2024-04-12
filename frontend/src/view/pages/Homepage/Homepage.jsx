import React, { useEffect, useState } from 'react'
import { UserData } from '../../../utils/UserData'
import {useNavigate} from "react-router-dom"
import CustomSideBar from '../../components/CustomSideBar/CustomSideBar';
import { MenuOutlined} from "@ant-design/icons";

function Homepage({selectedItem}) {
  const userData=UserData();
const navigate=useNavigate();

const [drawer,setDrawer]=useState(false)

const [frameLoading,setFrameLoading] = useState(false);
  useEffect(() => {
    if(!userData){
      navigate("/login");
    }
  },[])
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <CustomSideBar drawer={drawer} />
      {frameLoading ? (
        <div>Loading</div>
      ) : (
        <div style={{ width: "75%", padding: 20 }}  onClick={() => {
          console.log("clickedd")
        }}>
          <div className="drawer-button">
          <MenuOutlined onClick={() => setDrawer(!drawer)}/>
            </div>

            <div style={{width:"100%"}}  onClick={() => {
              console.log("clicked")
            }}>
              azdad
              </div>
        </div>
      )}

      
    </div>
  )
}

export default Homepage
