import React, { useState } from "react";
import CustomSideBar from "../../components/CustomSideBar/CustomSideBar";
import { MenuOutlined } from "@ant-design/icons";

function Dashboard() {
  const [drawer, setDrawer] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        height: "100%",
      }}
    >
      <CustomSideBar selectedItem="dashboard" drawer={drawer} />
      <div
        style={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          margin: 20,
          height:"100vh"
        }}
        onClick={() => setDrawer(!drawer)}
      >
        

        
      </div>

      <div className="drawer-button">
          <MenuOutlined onClick={() => setDrawer(!drawer)} />
        </div>
    </div>
  );
}

export default Dashboard;
