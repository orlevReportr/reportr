import React, { useEffect, useState } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { Button, Input, Modal, Popover, Select, Tabs } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import PlayIcon from "../../icons/PlayIcon";
import axiosRequest from "../../../utils/AxiosConfig";
import { UserData } from "../../../utils/UserData";
import { AudioRecorder } from "react-audio-voice-recorder";
import { useAudioRecorder } from "react-audio-voice-recorder";
import ChevronRight from "../../icons/ChevronRight";
import * as Showdown from "showdown";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import ReactMde from "react-mde";

function ConsultMeeting() {
  const { clientRecordId } = useParams();
  const [templates, setTemplates] = useState([]);
  const userData = UserData();

  const [selectedClientRecord, setSelectedClientRecord] = useState(null);

  const [socket, setSocket] = useState(null);
  const [botId, setBotId] = useState(null);
  const [onlineTranscription, setOnlineTranscription] = useState([]);
  const [nonSelectedTemplates, setNonSelectedTemplates] = useState([]);

  const converter = new Showdown.Converter();

  const [editorContents, setEditorContents] = useState({});
  const [selectedTabs, setSelectedTabs] = useState({});
  useEffect(() => {
    axiosRequest.post("/template/get", { userId: userData.id }).then((res) => {
      setTemplates(res.data.templates);
    });
  }, []);

  useEffect(() => {
    axiosRequest
      .post("/clientRecord/getOne", { clientRecordId })
      .then((res) => {
        const clientRecord = res.data.clientRecord;
        setSelectedClientRecord(clientRecord);
        setOnlineTranscription(clientRecord.transcript);

        const listOfAlreadySelectedTemplates = clientRecord.notes.map(
          (template) => template.templateId
        );

        // Set non-selected templates
        setNonSelectedTemplates(
          templates.filter(
            (template) => !listOfAlreadySelectedTemplates.includes(template.id)
          )
        );

        // Set editor contents based on the existing notes
        const newEditorContents = {};
        clientRecord.notes.forEach((note) => {
          newEditorContents[note.templateId] = note.noteContent || "";
        });
        setEditorContents(newEditorContents);

        setBotId(clientRecord.botId);
        if (!socket) {
          const newSocket = io(import.meta.env.VITE_BACKEND);
          setSocket(newSocket);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [clientRecordId, templates]);

  useEffect(() => {
    if (socket && botId) {
      socket.emit("joinBot", botId.toString());

      socket.on("transcriptionAdded", (data) => {
        console.log("Received transcription:", data);

        setOnlineTranscription((prevTranscription) => [
          ...prevTranscription,
          data,
        ]);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [socket, botId]);

  const handleAddTemplate = (templateId) => {
    axiosRequest
      .post("/clientrecord/add-template", {
        templateId,
        clientRecordId,
      })
      .then((res) => {
        console.log("azdaz");
        setSelectedClientRecord(res.data.clientRecord);
        setOnlineTranscription(res.data.clientRecord.transcript);
        const listOfAlreadySelectedTemplates = res.data.clientRecord.notes.map(
          (tempalte) => tempalte.templateId
        );
        setNonSelectedTemplates(
          templates.filter(
            (template) => !listOfAlreadySelectedTemplates.includes(template.id)
          )
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSaveTemplate = (templateId) => {
    axiosRequest
      .post("/clientrecord/update-template", {
        templateId,
        content: editorContents[templateId],
        clientRecordId,
      })
      .then((res) => {})
      .catch((err) => {
        // Handle error
        console.log(err);
      });
  };
  return (
    <BaseLayout>
      {selectedClientRecord && (
        <div>
          {selectedClientRecord.type === "inPerson" && (
            <div className="w-full h-full mt-4 md:mt-10 flex flex-col items-center">
              {" "}
              <div className="w-[90%] md:w-[70%]">
                <div className="w-full relative">
                  <div className="flex w-full relative overflow-x-hidden border-t-2 px-2 rounded-t-md bg-white border-x-2 items-center gap-[6px] text-sm -mt-[32px]">
                    <button className="truncate div-container duration-75 hover:text-primary h-full px-2 py-[5.5px] flex items-center gap-2 active-tab-notes">
                      {" "}
                      <p className="text-fade font-medium overflow-hidden text-[13px]">
                        Transcript
                      </p>
                    </button>{" "}
                    <span className="h-[12px] border-[0.5px] border-[#D0D5DD]"></span>
                    {selectedClientRecord.note &&
                      selectedClientRecord.note.map((note, index) => (
                        <button
                          key={index}
                          className="truncate div-container duration-75 hover:text-primary h-full px-2 py-[5.5px] flex items-center gap-2 text-[#667085]"
                        >
                          <p className="text-fade font-medium overflow-hidden text-[13px]">
                            Template: {note.templateName}
                          </p>
                        </button>
                      ))}
                  </div>{" "}
                  <div className="bottom-0 -mb-[1.8px] z-[5] absolute left-0 h-[2px] bg-secondary"></div>
                </div>
              </div>{" "}
              <div className="w-[90%] md:w-[70%] h-[70%] max-h-[600px]">
                <div className="flex w-full max-h-[600px] h-full ">
                  <div
                    className="bg-white relative flex-col justify-between w-full h-full overflow-hidden max-h-[600px] border-2 resize-none rounded-b-md p-4 focus:outline-none "
                    id="note-pad-container"
                  >
                    <div className="text-[#BABABA] ">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: converter.makeHtml(
                            selectedClientRecord.transcription
                          ),
                        }}
                        className="py-2 z-1 text-normal h-[150px] text-labelSubText text-[11px] leading-[180%] w-[90%] relative overflow-clip"
                      ></div>
                    </div>{" "}
                  </div>
                </div>
              </div>{" "}
            </div>
          )}

          {selectedClientRecord.type === "online" && (
            <div className="w-full h-full mt-4 md:mt-10 flex flex-col items-center">
              <Tabs
                defaultActiveKey="1"
                className="custom-tabs w-[90%] md:w-[70%] h-[70%] max-h-[600px]"
                tabBarExtraContent={
                  nonSelectedTemplates.length > 0 && (
                    <div>
                      <Popover
                        style={{ padding: 0 }}
                        content={
                          <div className="flex flex-col gap-[10px]">
                            {nonSelectedTemplates.map((template) => (
                              <div
                                onClick={() => {
                                  handleAddTemplate(template.id);
                                }}
                                className="flex gap-[5px] cursor-pointer p-[5px] hover:bg-gray-200 rounded items-center"
                              >
                                <span>{template.templateTitle}</span>
                              </div>
                            ))}
                          </div>
                        }
                        trigger="click"
                        placement="bottom"
                      >
                        <Button type="primary" onClick={handleAddTemplate}>
                          Add Template
                        </Button>
                      </Popover>
                    </div>
                  )
                }
                tabBarGutter={8}
                tabBarStyle={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "2px solid #D0D5DD",
                  marginBottom: "-1.8px",
                  backgroundColor: "#fff",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <Tabs.TabPane
                  className="w-full"
                  tab={
                    <div className="truncate div-container duration-75 hover:text-primary px-2 py-[5.5px] flex items-center gap-2 active-tab-notes w-full">
                      <p className="text-fade font-medium text-[13px]">
                        Transcript
                      </p>
                    </div>
                  }
                  key="1"
                >
                  <div className="w-full h-[70%] max-h-[600px]">
                    <div className="flex w-full max-h-[600px] h-full ">
                      <div className="bg-white relative flex-col justify-between w-full h-full overflow-hidden max-h-[600px] border-2 resize-none rounded-b-md p-4 focus:outline-none ">
                        <div className="text-[#BABABA] ">
                          <div className="py-2 z-1 text-normal h-[150px] text-labelSubText text-[11px] leading-[180%] w-[90%] relative overflow-clip">
                            {" "}
                            {onlineTranscription &&
                              onlineTranscription.map((sentence, index) => {
                                const isNewSpeaker =
                                  index === 0 ||
                                  sentence.speaker !==
                                    onlineTranscription[index - 1].speaker;
                                if (isNewSpeaker) {
                                  return (
                                    <div key={index}>
                                      <b>{sentence.speaker}:</b>
                                      {sentence.words.map((word, wordIndex) => (
                                        <span key={wordIndex}>
                                          {word.text}{" "}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <span key={index}>
                                      {sentence.words.map((word, wordIndex) => (
                                        <span key={wordIndex}>
                                          {word.text}{" "}
                                        </span>
                                      ))}
                                    </span>
                                  );
                                }
                              })}
                          </div>
                        </div>{" "}
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>
                {selectedClientRecord.notes &&
                  selectedClientRecord.notes.map((note, index) => {
                    const templateId = note.templateId;
                    return (
                      <Tabs.TabPane
                        className="w-full"
                        tab={
                          <div className="w-full truncate div-container duration-75 hover:text-primary px-2 py-[5.5px] flex items-center gap-2 text-[#667085]">
                            <p className="text-fade font-medium text-[13px]">
                              Template: {note.templateName}
                            </p>
                          </div>
                        }
                        key={index + 2}
                      >
                        {" "}
                        <div className="w-full">
                          <ReactMde
                            value={editorContents[templateId] || ""}
                            onChange={(value) =>
                              setEditorContents((prev) => ({
                                ...prev,
                                [templateId]: value,
                              }))
                            }
                            selectedTab={selectedTabs[templateId] || "write"}
                            onTabChange={(tab) =>
                              setSelectedTabs((prev) => ({
                                ...prev,
                                [templateId]: tab,
                              }))
                            }
                            generateMarkdownPreview={(markdown) =>
                              Promise.resolve(converter.makeHtml(markdown))
                            }
                          />
                          <div className="flex gap-[10px]">
                            <Button
                              type="primary"
                              onClick={() => handleSaveTemplate(templateId)}
                            >
                              Generate Transcript
                            </Button>
                            <Button
                              type="primary"
                              onClick={() => handleSaveTemplate(templateId)}
                            >
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      </Tabs.TabPane>
                    );
                  })}
              </Tabs>
            </div>
          )}
        </div>
      )}
    </BaseLayout>
  );
}

export default ConsultMeeting;
