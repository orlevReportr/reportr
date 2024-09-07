import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomSideBar from "./../../components/CustomSideBar/CustomSideBar";
import axios from "axios";
import { Button, message } from "antd";

import { MenuOutlined } from "@ant-design/icons";

import "./Meeting.css";
import Markdown from "react-markdown";
function Meeting() {
  const { clientRecordId } = useParams();

  const [frameLoading, setFrameLoading] = useState();
  const [buttonLoading, setButtonLoading] = useState();
  const [clientRecord, setClientRecord] = useState();
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusButton = () => {
    if (clientRecord.status === "Started") {
      setButtonLoading(true);
      axios
        .post(`${import.meta.env.VITE_BACKEND}/clientRecord/stop-recording`, {
          clientRecordId: clientRecord.id,
        })
        .then((res) => {
          setClientRecord((prevClientRecord) => {
            return { ...prevClientRecord, status: "Stopped" };
          });

          showtoast("success", "Stopped recording");
        })
        .catch((err) => {
          showtoast("error", "Error while stopping recording");
        })
        .finally(() => {
          setButtonLoading(false);
        });
    } else if (
      clientRecord.status === "Waiting" ||
      clientRecord.status === "Stopped"
    ) {
      setButtonLoading(true);
      axios
        .post(`${import.meta.env.VITE_BACKEND}/clientRecord/start-recording`, {
          clientRecordId: clientRecord.id,
        })
        .then((res) => {
          showtoast("success", "Started recording");
          setClientRecord((prevClientRecord) => {
            return { ...prevClientRecord, status: "Started" };
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
      .post(`${import.meta.env.VITE_BACKEND}/clientRecord`, {
        clientRecordId,
      })
      .then((res) => {
        setClientRecord(res.data.clientRecord);
        console.log(res.data.clientRecord.status);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally((err) => {
        setFrameLoading(false);
      });
  }, []);
  const [summary, setSummary] = useState(true);

  const [drawer, setDrawer] = useState(false);
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <CustomSideBar drawer={drawer} />
      <div className="drawer-button">
        <MenuOutlined onClick={() => setDrawer(!drawer)} />
      </div>
      {frameLoading ? (
        <div>Loading</div>
      ) : (
        <div
          style={{ width: "75%", padding: 20 }}
          onClick={() => {
            setDrawer(!drawer);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>ClientRecord </h1>
            {clientRecord && getStatusChangeButton(clientRecord.status)}
          </div>

          {clientRecord && clientRecord.transcript.length !== 0 ? (
            <div className="cards-container">
              <div className="big-card">
                <h2>Transcript</h2>

                {clientRecord &&
                  clientRecord.transcript.map((sentence, index) => {
                    const isNewSpeaker =
                      index === 0 ||
                      sentence.speaker !==
                        clientRecord.transcript[index - 1].speaker;
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
                <div style={{ display: "flex", marginBottom: 10 }}>
                  <div
                    className={`summary-container left ${
                      summary && "selected-summary"
                    }`}
                    onClick={() => {
                      setSummary(!summary);
                    }}
                  >
                    <h5>Summary</h5>
                  </div>
                  <div
                    className={`summary-container right ${
                      !summary && "selected-summary"
                    }`}
                    onClick={() => {
                      setSummary(!summary);
                    }}
                  >
                    <h5>Formatted Summary</h5>
                  </div>
                </div>
                {summary && <div>{clientRecord && clientRecord.summary}</div>}

                {!summary && (
                  <Markdown>
                    {clientRecord && clientRecord.formattedSummary}
                  </Markdown>
                )}
              </div>
            </div>
          ) : (
            <span>ClientRecord didn't start yet</span>
          )}
        </div>
      )}

      {contextHolder}
    </div>
  );
}

export default Meeting;
