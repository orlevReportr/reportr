import React, { useEffect, useState } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { Button, Popover, Spin, Tabs } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axiosRequest from "../../../utils/AxiosConfig";
import { UserData } from "../../../utils/UserData";
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

  const [loading, setLoading] = useState(false);
  const [editorContents, setEditorContents] = useState({});
  const [selectedTabs, setSelectedTabs] = useState({});
  useEffect(() => {
    axiosRequest
      .post("/template/getAll", { userId: userData.id })
      .then((res) => {
        setTemplates(res.data.templates);
      });
  }, []);

  useEffect(() => {
    if (templates.length === 0) return;
    axiosRequest
      .post("/clientRecord/getOne", { clientRecordId })
      .then((res) => {
        const clientRecord = res.data.clientRecord;
        setSelectedClientRecord(clientRecord);
        setOnlineTranscription(clientRecord.transcript);

        const listOfAlreadySelectedTemplates = clientRecord.notes.map(
          (template) => template.templateId
        );
        // console.log(templates.map((template) => template.id));
        // console.log(listOfAlreadySelectedTemplates);

        setNonSelectedTemplates(
          templates.filter(
            (template) => !listOfAlreadySelectedTemplates.includes(template.id)
          )
        );

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
        setEditorContents((prev) => ({
          ...prev,
          [templateId]: res.data.clientRecord.notes.find(
            (note) => note.templateId === templateId
          )?.noteContent,
        }));
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

  const handleGenerateSummary = (templateId) => {
    let currentTranscription;
    if (selectedClientRecord.type === "inPerson") {
      currentTranscription = selectedClientRecord.transcription;
    } else if (selectedClientRecord.type === "online") {
      currentTranscription = onlineTranscription
        .map((sentence, index) => {
          const isNewSpeaker =
            index === 0 ||
            sentence.speaker !== onlineTranscription[index - 1].speaker;
          if (isNewSpeaker) {
            return `${sentence.speaker}: ${sentence.words
              .map((word) => word.text)
              .join(" ")}`;
          } else {
            return sentence.words.map((word) => word.text).join(" ");
          }
        })
        .join(" ");
    }
    setLoading(true);
    axiosRequest
      .post("/template/summary", {
        content: editorContents[templateId],
        transcriptionText: currentTranscription,
      })
      .then((res) => {
        setEditorContents((prev) => ({
          ...prev,
          [templateId]: res.data.summary,
        }));
      })
      .catch((err) => {})
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <BaseLayout>
      {selectedClientRecord && (
        <div>
          {selectedClientRecord.type === "inPerson" && (
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
                          <div
                            dangerouslySetInnerHTML={{
                              __html: converter.makeHtml(
                                selectedClientRecord.transcription
                              ),
                            }}
                            className="py-2 z-1 text-normal min-h-[150px] overflow-auto text-labelSubText text-[11px] leading-[180%] w-[90%] relative"
                          ></div>
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
                        <div className="w-full flex flex-col gap-[10px]">
                          <ReactMde
                            value={editorContents[templateId] || ""}
                            onChange={(value) =>
                              setEditorContents((prev) => ({
                                ...prev,
                                [templateId]: value,
                              }))
                            }
                            selectedTab={selectedTabs[templateId] || "preview"}
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
                          {loading ? (
                            <Spin indicator={<LoadingOutlined spin />} />
                          ) : (
                            <div className="flex gap-[10px]">
                              <Button
                                type="primary"
                                onClick={() =>
                                  handleGenerateSummary(templateId)
                                }
                              >
                                Generate summary
                              </Button>
                              <Button
                                type="primary"
                                onClick={() => handleSaveTemplate(templateId)}
                              >
                                Save Notes
                              </Button>
                            </div>
                          )}
                        </div>
                      </Tabs.TabPane>
                    );
                  })}
              </Tabs>
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
                          <div className="py-2 z-1 text-normal min-h-[150px] overflow-auto text-labelSubText text-[11px] leading-[180%] w-[90%] relative">
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
                        <div className="w-full flex flex-col gap-[10px]">
                          <ReactMde
                            value={editorContents[templateId] || ""}
                            onChange={(value) =>
                              setEditorContents((prev) => ({
                                ...prev,
                                [templateId]: value,
                              }))
                            }
                            selectedTab={selectedTabs[templateId] || "preview"}
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
                          {loading ? (
                            <Spin indicator={<LoadingOutlined spin />} />
                          ) : (
                            <div className="flex gap-[10px]">
                              <Button
                                type="primary"
                                onClick={() =>
                                  handleGenerateSummary(templateId)
                                }
                              >
                                Generate summary
                              </Button>
                              <Button
                                type="primary"
                                onClick={() => handleSaveTemplate(templateId)}
                              >
                                Save Notes
                              </Button>
                            </div>
                          )}
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
