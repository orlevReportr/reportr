import React, { useState, useEffect } from "react";
import CustomSideBar from "../../components/CustomSideBar/CustomSideBar";
import {
  PlusOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  DownOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  FloatButton,
  Input,
  Modal,
  Dropdown,
  Button,
  message,
  Spin,
} from "antd";

import axios from "axios";
import { UserData } from "../../../utils/UserData";

import "./Meetings.css";

import { useNavigate } from "react-router-dom";
function Meetings({ selectedItem }) {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [frameLoading, setFrameLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userData = UserData();
  const navigate = useNavigate();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");

  const [meetingProvider, setMeetingProvider] = useState("Zoom");
  const meetingProvidersList = [
    {
      label: "Zoom",
      key: "1",
    },
    {
      label: "Teams",
      key: "2",
    },
    {
      label: "Google Meets",
      key: "3",
    },
  ];

  const handleMeetingProviderMenuClick = (e) => {
    setMeetingProvider(
      meetingProvidersList.find((item) => item.key === e.key).label
    );
  };
  const [messageApi, contextHolder] = message.useMessage();
  const showtoast = (type, message) => {
    messageApi.open({
      type: type,
      content: message,
      style: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: "absolute",
      },
    });
  };
  const handleCreateMeeting = () => {
    setButtonLoading(true);
    axios
      .post(`${import.meta.env.VITE_BACKEND}/meeting/add`, {
        meetingUrl,
        userId: userData.id,
        meetingTitle,
      })
      .then((res) => {
        setIsModalOpen(false);

        showtoast("success", "Created meeting successfully");
        setMeetings((prevMeeting) => {
          return [...prevMeeting, res.data.meeting];
        });
      })
      .catch((err) => {
        setIsModalOpen(false);
        const errorMessage = err.response
          ? err.response.data.message
          : "An error occurred";
        showtoast("error", errorMessage);
      })
      .finally(() => {
        setButtonLoading(false);
      });
  };
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    setFrameLoading(true);
    axios
      .post(`${import.meta.env.VITE_BACKEND}/meeting/get`, {
        userId: userData.id,
      })
      .then((res) => {
        setMeetings(res.data.meetings);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setFrameLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const getTag = (status) => {
    if (status === "Waiting") {
      return <ClockCircleOutlined style={{ marginRight: 10 }} />;
    } else if (status === "Started") {
      return <PlayCircleOutlined style={{ marginRight: 10 }} />;
    } else if (status === "Stopped") {
      return <CheckCircleOutlined style={{ marginRight: 10 }} />;
    }
  };

  useEffect(() => {
    if(!userData){
      navigate("/login")
    }
  },[])

  const [drawer, setDrawer] = useState(false);
  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "row",height:"100%" }}>
       <div className="drawer-button">
          <MenuOutlined onClick={() => setDrawer(!drawer)} />
        </div>
      <CustomSideBar selectedItem="meetings" drawer={drawer} />
      <div
        style={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          margin: 20,
        }}
        onClick={() => setDrawer(!drawer)}
      >
       
       <div>
       <h1>My Meetings</h1>
        {frameLoading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        ) : meetings.length === 0 ? (
          <span>No meetings</span>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "start",
              alignContent: "center",
            }}
          >
            {meetings.map((meeting) => {
              return (
                <div className="meeting-container">
                  <div style={{ padding: 10, borderBottom: "1px grey solid" }}>
                    <span>{meeting.meetingTitle}</span>
                  </div>

                  <div style={{ padding: 10 }}>
                    <span>
                      <CalendarOutlined style={{ marginRight: 10 }} />
                      {formatDate(meeting.createdAt)}
                    </span>
                  </div>
                  <div style={{ padding: 10 }}>
                    <span>
                      {getTag(meeting.status)}
                      {meeting.status}
                    </span>
                  </div>
                  <div style={{ padding: 10,display:"flex",justifyContent:"space-around" }}>
                    <span
                      style={{
                        color: "var(--primary-color)",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate(`/meeting/${meeting._id}`);
                      }}
                    >
                      Transript
                    </span>
                    <span
                      style={{
                        color: "var(--primary-color)",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate(`/chat`,{ state: { transcript:meeting.formattedTranscript } });
                      }}
                    >
                      Chat
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
       </div>
      </div>

      <Modal
        title="Create Meeting"
        open={isModalOpen}
        onOk={() => {
          handleCreateMeeting();
        }}
        onCancel={handleCancel}
        okText="Create"
        okButtonProps={{ loading: buttonLoading }}
      >
        <div>
          <label>Meeting Title:</label>
          <Input
            prefix={<InfoCircleOutlined />}
            value={meetingTitle}
            onChange={(e) => {
              setMeetingTitle(e.target.value);
            }}
          ></Input>
        </div>
        <br></br>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Meeting Provider:</label>
          <Dropdown
            menu={{
              items: meetingProvidersList,
              onClick: handleMeetingProviderMenuClick,
            }}
            trigger={["click"]}
          >
            <Button style={{ textAlign: "start" }}>
              {meetingProvider}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <br></br>
        <div>
          <label>Meeting Url:</label>
          <Input
            prefix={<LinkOutlined />}
            value={meetingUrl}
            onChange={(e) => {
              setMeetingUrl(e.target.value);
            }}
          ></Input>
        </div>
      </Modal>
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24 }}
        onClick={() => {
          showModal();
        }}
      />
      {contextHolder}
    </div>
  );
}

export default Meetings;
