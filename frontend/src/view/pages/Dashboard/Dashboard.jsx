import React, { useEffect, useState } from "react";
import CustomSideBar from "../../components/CustomSideBar/CustomSideBar";
import {
  AudioOutlined,
  HistoryOutlined,
  MenuOutlined,
  UserOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import "./Dashboard.css";
import { Card, Statistic } from "antd";
import { UserData } from "../../../utils/UserData";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Dashboard() {
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();
  const userData = UserData();
  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_BACKEND}/user/stats`, {
        userId: userData.id,
      })
      .then((res) => {
        setStats(res.data.stats);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        height: "100%",
      }}
    >
      <div className="drawer-button">
        <MenuOutlined onClick={() => setDrawer(!drawer)} />
      </div>
      <CustomSideBar selectedItem="dashboard" drawer={drawer} />
      <div
        style={{
          width: "80%",
          display: "flex",
          margin: 20,
        }}
        onClick={() => setDrawer(!drawer)}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            height: "min-content",
            flexWrap: "wrap",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <Card
            title="Total Meetings"
            hoverable={true}
            style={{ width: "200px" }}
            loading={loading}
          >
            <Statistic
              title="Meetings"
              value={stats.totalMeetings}
              prefix={<WechatOutlined />}
            />
          </Card>

          <Card
            title="Total Audios"
            hoverable={true}
            style={{ width: "200px" }}
            loading={loading}
          >
            <Statistic
              title="Audios"
              value={stats.totalAudios}
              prefix={<AudioOutlined />}
            />
          </Card>
          <Card
            title="Total Meeting Time"
            hoverable={true}
            style={{ width: "200px" }}
            loading={loading}
          >
            <Statistic
              title="Time"
              value={stats.totalMeetingTime}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
