import React, { useEffect, useState, useRef } from "react";
import "./Chatting.css";
import { LoadingOutlined, MenuOutlined, SendOutlined } from "@ant-design/icons";
import CustomSideBar from "../../components/CustomSideBar/CustomSideBar";
import { useLocation, useNavigate } from "react-router-dom";
import { UserData } from "../../../utils/UserData";
import { Input } from "antd";
import axios from "axios";

function Chatting() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState();
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: `based on this transcript answer the following questions\n ${transcript}`,
    },
  ]);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const userData = UserData();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    }
    if (!state) {
      navigate("/");
    } else {
      setTranscript(state.transcript);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() !== "") {
      setMessages([
        ...messages,
        { role: "user", content: currentMessage.trim() },
      ]);
      setCurrentMessage("");
      openAiRequest(currentMessage);
    }
  };

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const openAiRequest = (newCommand) => {
    setLoading(true);
    const url = "https://api.openai.com/v1/chat/completions";

    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };

    const data = {
      model: "gpt-3.5-turbo",
      messages: [...messages, { role: "user", content: newCommand }],
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        const gptResponse = response.data.choices[0].message.content;

        console.log("Response:", gptResponse);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "system", content: gptResponse },
        ]);
      })

      .catch((error) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "system", content: "Connection error" },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
      <CustomSideBar drawer={drawer} />
      <div
        style={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          margin: 20,
          height: "100%", // Ensure the parent container occupies the full height
          position: "relative", // Add position relative to ensure sticky works
        }}
        onClick={() => setDrawer(!drawer)}
      >
        <div
          style={{
            width: "90%",
          }}
        >
          {" "}
          {messages &&
            messages.map((e, i) => {
              if (i === 0) {
                return (
                  <div key={i} className="message" style={{ marginBottom: 10 }}>
                    <b style={{ margin: 0 }}>Reportr AI</b>
                    <p style={{ margin: 0 }}>
                      Ask me any question about this transcript!
                    </p>
                  </div>
                );
              }
              if (i !== 0) {
                return (
                  <div key={i} className="message" style={{ marginBottom: 10 }}>
                    <b style={{ margin: 0 }}>
                      {e.role === "user" ? "You" : "Reportr AI"}
                    </b>
                    <p style={{ margin: 0 }}>{e.content}</p>
                  </div>
                );
              }
            })}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ position: "sticky", bottom: 10, height: "auto" }}>
          <Input
            disabled={loading}
            value={currentMessage}
            onChange={handleInputChange}
            onPressEnter={handleKeyPress}
            suffix={
              loading ? (
                <LoadingOutlined />
              ) : (
                <SendOutlined onClick={handleSendMessage} />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Chatting;
