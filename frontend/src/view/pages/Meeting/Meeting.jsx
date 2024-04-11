import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomSideBar from "./../../components/CustomSideBar/CustomSideBar";
import axios from "axios";
import { Button, message } from "antd";
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
      .get(`${import.meta.env.VITE_BACKEND}/meeting/${meetingId}`)
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
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <CustomSideBar />
      {frameLoading ? (
        <div>Loading</div>
      ) : (
        <div style={{ width: "80%", padding: 20 }}>
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
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                background: "#141414",
                width: "48%",
                borderRadius: "10px",
                padding: 5,
              }}
            >
              {meeting &&
                meeting.transcript.map((sentence, index) => {
                  const isNewSpeaker =
                    index === 0 ||
                    sentence.speaker !== meeting.transcript[index - 1].speaker;
                  if (isNewSpeaker) {
                    return (
                      <div key={index}>
                        <h2>{sentence.speaker}</h2>
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
            <div
              style={{
                background: "#141414",
                width: "48%",
                borderRadius: "10px",
                padding: 10,
              }}
            >
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
