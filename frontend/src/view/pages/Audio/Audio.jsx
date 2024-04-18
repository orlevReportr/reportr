import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomSideBar from "./../../components/CustomSideBar/CustomSideBar";
import axios from "axios";
import { message } from "antd";

import { MenuOutlined } from "@ant-design/icons";
import Markdown from "react-markdown";
import "./Audio.css";
function Audio() {
  const { audioId } = useParams();

  const [frameLoading, setFrameLoading] = useState();
  const [buttonLoading, setButtonLoading] = useState();
  const [audio, setAudio] = useState();
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
  useEffect(() => {
    setFrameLoading(true);
    axios
      .post(`${import.meta.env.VITE_BACKEND}/audio`, {
        audioId,
      })
      .then((res) => {
        setAudio(res.data.audio);
        console.log(res.data.audio.status);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally((err) => {
        setFrameLoading(false);
      });
  }, []);

  const [summary,setSummary]=useState(true)

  const [drawer, setDrawer] = useState(false);
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <div className="drawer-button">
        <MenuOutlined onClick={() => setDrawer(!drawer)} />
      </div>
      <CustomSideBar drawer={drawer} />
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
            <h1>Audio </h1>
          </div>

          <div className="cards-container">
            <div className="big-card">
              <h2>Transcript</h2>
              {audio &&
                audio.utterances.map((utterance, index) => {
                  return (
                    <div key={index}>
                      <b>Speaker {utterance.speaker}:</b>
                      <p>{utterance.text}</p>
                    </div>
                  );
                })}
            </div>

            <div className="big-card">
              <div style={{ display: "flex",marginBottom:10 }}>
                <div className={`summary-container left ${summary&& "selected-summary"}`} onClick={()=>{
                  setSummary(!summary)
                }}>
                  <h5>Summary</h5>
                </div>
                <div className={`summary-container right ${!summary&& "selected-summary"}`} onClick={()=>{
                  setSummary(!summary)
                }}>
                  <h5>Formatted Summary</h5>
                </div>
              </div>
              {summary&&<div>{audio && audio.summary}</div>}

              {!summary&&<Markdown>{audio && audio.formattedSummary}</Markdown>}
            </div>
          </div>
        </div>
      )}

      {contextHolder}
    </div>
  );
}

export default Audio;
