import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomSideBar from "./../../components/CustomSideBar/CustomSideBar";
import axios from "axios";
import { Button, message } from "antd";

import { MenuOutlined} from "@ant-design/icons";

import "./Meeting.css";
function Meeting() {
  const { meetingId } = useParams();

  const [frameLoading, setFrameLoading] = useState();
  const [buttonLoading, setButtonLoading] = useState();
  const [meeting, setMeeting] = useState();
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusButton = () => {
    if (meeting.status === "Started") {
      setButtonLoading(true);
      axios
        .post(`${import.meta.env.VITE_BACKEND}/meeting/stop-recording`, {
          meetingId: meeting.id,
        })
        .then((res) => {
          setMeeting((prevMeeting) => {
            return { ...prevMeeting, status: "Stopped" };
          });

          showtoast("success", "Stopped recording");
        })
        .catch((err) => {
          showtoast("error", "Error while stopping recording");
        })
        .finally(() => {
          setButtonLoading(false);
        });
    } else if (meeting.status === "Waiting" || meeting.status === "Stopped") {
      setButtonLoading(true);
      axios
        .post(`${import.meta.env.VITE_BACKEND}/meeting/start-recording`, {
          meetingId: meeting.id,
        })
        .then((res) => {
          showtoast("success", "Started recording");
          setMeeting((prevMeeting) => {
            return { ...prevMeeting, status: "Started" };
          });
        })
        .catch((err) => {
          showtoast("error", "Error while starting recording");
        })
        .finally(() => {
          setButtonLoading(false);
        });
    }
  };

  const getStatusChangeButton = (status) => {
    if (status === "Started") {
      return (
        <Button
          type="primary"
          onClick={handleStatusButton}
          loading={buttonLoading}
        >
          Stop Recording
        </Button>
      );
    } else if (status === "Waiting") {
      return (
        <Button
          type="primary"
          onClick={handleStatusButton}
          loading={buttonLoading}
        >
          Start Recording
        </Button>
      );
    } else if (status === "Stopped") {
      return (
        <Button
          type="primary"
          onClick={handleStatusButton}
          loading={buttonLoading}
        >
          Start Recording
        </Button>
      );
    }
  };

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
  useEffect(() => {
    setFrameLoading(true);
    axios
      .post(`${import.meta.env.VITE_BACKEND}/meeting`, {
        meetingId,
      })
      .then((res) => {
        setMeeting(res.data.meeting);
        console.log(res.data.meeting.status);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally((err) => {
        setFrameLoading(false);
      });
  }, []);

  const [drawer,setDrawer]=useState(false);
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <CustomSideBar drawer={drawer}/>
      <div className="drawer-button">
          <MenuOutlined onClick={() => setDrawer(!drawer)}/>
            </div>
      {frameLoading ? (
        <div>Loading</div>
      ) : (
        <div style={{ width: "75%", padding: 20 }} onClick={()=>{
          setDrawer(!drawer);
        }}>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>Meeting </h1>
            {meeting && getStatusChangeButton(meeting.status)}
          </div>

          <div
           className="cards-container"
           
          >
            <div className="big-card">
              <h2>Transcript</h2>

              {meeting &&
                meeting.transcript.map((sentence, index) => {
                  const isNewSpeaker =
                    index === 0 ||
                    sentence.speaker !== meeting.transcript[index - 1].speaker;
                  if (isNewSpeaker) {
                    return (
                      <div key={index}>
                        <b>{sentence.speaker}:</b>
                        {sentence.words.map((word, wordIndex) => (
                          <span key={wordIndex}>{word.text} </span>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <span key={index}>
                        {sentence.words.map((word, wordIndex) => (
                          <span key={wordIndex}>{word.text} </span>
                        ))}
                      </span>
                    );
                  }
                })}
            </div>

            <div className="big-card">
              <h2>Summary</h2>
              <div>{meeting && meeting.summary}</div>
            </div>
          </div>
        </div>
      )}

      {contextHolder}
    </div>
  );
}

export default Meeting;
