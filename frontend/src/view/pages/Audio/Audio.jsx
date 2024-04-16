import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomSideBar from "./../../components/CustomSideBar/CustomSideBar";
import axios from "axios";
import {  message } from "antd";

import { MenuOutlined} from "@ant-design/icons";

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

  const [drawer,setDrawer]=useState(false);
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <div className="drawer-button">
          <MenuOutlined onClick={() => setDrawer(!drawer)}/>
            </div>
      <CustomSideBar drawer={drawer}/>
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
            <h1>Audio </h1>
          </div>

          <div
           className="cards-container"
           
          >
            <div className="big-card">
              <h2>Transcript</h2>
{
    audio&& audio.utterances.map((utterance,index)=>{
        return (<div key={index}>
            <b>Speaker {utterance.speaker}:</b>
            <p>
            {utterance.text}
            </p>
          </div>)
    })
}
              {/* {Audio &&
                Audio.transcript.map((sentence, index) => {
                  const isNewSpeaker =
                    index === 0 ||
                    sentence.speaker !== Audio.transcript[index - 1].speaker;
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
                })} */}
            </div>

            <div className="big-card">
              <h2>Summary</h2>
              <div>{audio && audio.summary}</div>
            </div>
          </div>
        </div>
      )}

      {contextHolder}
    </div>
  );
}

export default Audio;
