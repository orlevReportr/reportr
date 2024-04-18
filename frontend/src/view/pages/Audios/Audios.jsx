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

import "./Audios.css";

import { useNavigate } from "react-router-dom";
function Audios({ selectedItem }) {
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

  const handleAudioChange = (e) => {
    setFile(e.target.files[0]);
    setAudioUrl(URL.createObjectURL(e.target.files[0]));
    console.log(URL.createObjectURL(e.target.files[0]))
  };
  const [audioTitle,setAudioTitle]=useState("")
  const [file,setFile]=useState(null)
  const [audioUrl, setAudioUrl] = useState(null);

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
  const handleCreateAudio = () => {
    setButtonLoading(true);
    const formData=new FormData();
    formData.append("audioTitle",audioTitle)
    formData.append("userId",userData.id)
    formData.append('file', file);
    console.log(file)
    axios
      .post(`${import.meta.env.VITE_BACKEND}/audio/add`,formData)
      .then((res) => {
        setIsModalOpen(false);

        showtoast("success", "Created audio successfully");
        setAudios((prevAudios) => {
          return [...prevAudios, res.data.audio];
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
  const [audios, setAudios] = useState([]);

  useEffect(() => {
    if(!userData){
      navigate("/login")
    }
    setFrameLoading(true);
    axios
      .post(`${import.meta.env.VITE_BACKEND}/audio/get`, {
        userId: userData.id,
      })
      .then((res) => {
        setAudios(res.data.audios);
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

  const [drawer, setDrawer] = useState(false);


  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "row",height:"100%" }}>
      <div className="drawer-button">
          <MenuOutlined onClick={() => setDrawer(!drawer)} />
        </div>
      <CustomSideBar selectedItem="audios" drawer={drawer} />
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
       <h1>My Audios</h1>
        {frameLoading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        ) :!audios || audios.length === 0 ? (
          <span>No Audios</span>
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
            {audios &&audios.map((audio) => {
              return (
                <div className="meeting-container">
                  <div style={{ padding: 10, borderBottom: "1px grey solid" }}>
                    <span>{audio.audioTitle}</span>
                  </div>

                  <div style={{ padding: 10 }}>
                    <span>
                      <CalendarOutlined style={{ marginRight: 10 }} />
                      {formatDate(audio.createdAt)}
                    </span>
                  </div>
                 
                  <div style={{ padding: 10 ,display:"flex",justifyContent:"space-around"}}>
                    <span
                      style={{
                        color: "var(--primary-color)",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate(`/audio/${audio._id}`);
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
                        navigate(`/chat`,{ state: { transcript:audio.formattedTranscript } });
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
        title="Create Audio"
        open={isModalOpen}
        onOk={() => {
          handleCreateAudio();
        }}
        onCancel={handleCancel}
        okText="Create"
        okButtonProps={{ loading: buttonLoading }}
      >
        <div>
          <label>Audio Title:</label>
          <Input
            prefix={<InfoCircleOutlined />}
            value={audioTitle}
            onChange={(e)=>{
              setAudioTitle(e.target.value);
            }}
          ></Input>
        </div>
       
        <br></br>

        <div>
          <label>Audio File:</label>
          <Input
            prefix={<LinkOutlined />}
            type="file"
            onChange={handleAudioChange}
          ></Input>
          
        </div>
     
        {audioUrl && (
    <audio controls>
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  )}
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

export default Audios;
