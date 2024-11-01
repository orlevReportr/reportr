import React, { useEffect, useState } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { Button, Input, Modal, Popover, Select, Spin, Tabs } from "antd";
import { LoadingOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import PlayIcon from "../../icons/PlayIcon";
import axiosRequest from "../../../utils/AxiosConfig";
import { UserData } from "../../../utils/UserData";
import { AudioRecorder } from "react-audio-voice-recorder";
import { useAudioRecorder } from "react-audio-voice-recorder";
import ChevronRight from "../../icons/ChevronRight";
import * as Showdown from "showdown";
import { io } from "socket.io-client";
import ReactMde from "react-mde";

function Consult() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const userData = UserData();

  // State for each form field
  const [clientName, setClientName] = useState("");
  const [gender, setGender] = useState("Male");
  const [type, setType] = useState("inPerson");
  const [template, setTemplate] = useState();
  const [meetingUrl, setMeetingUrl] = useState("");
  const [clientConcent, setClientConcent] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const recorderControls = useAudioRecorder({}, (err) => console.table(err));
  const [errors, setErrors] = useState({});

  const [socket, setSocket] = useState(null);
  const [botId, setBotId] = useState(null);
  const [onlineTranscription, setOnlineTranscription] = useState([]);
  const audioDivRef = React.useRef();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const validateFields = () => {
    const newErrors = {};
    if (!clientName) newErrors.clientName = "Client Name is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!type) newErrors.type = "Type is required";
    if (!template) newErrors.template = "Template is required";
    if (type === "online" && !meetingUrl)
      newErrors.meetingUrl = "Meeting URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onFinish = () => {
    if (!validateFields()) return;

    console.log({
      clientName,
      gender,
      type,
      template,
      meetingUrl,
    });
    setIsModalOpen(true);
  };

  const handleChange = (field, value) => {
    switch (field) {
      case "clientName":
        setClientName(value);
        if (errors.clientName) {
          setErrors((prevErrors) => ({ ...prevErrors, clientName: "" }));
        }
        if (value === "") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            clientName: "Client Name is required",
          }));
        }
        break;
      case "gender":
        setGender(value);
        if (errors.gender) {
          setErrors((prevErrors) => ({ ...prevErrors, gender: "" }));
        }
        break;
      case "type":
        setType(value);
        if (errors.type) {
          setErrors((prevErrors) => ({ ...prevErrors, type: "" }));
        }
        if (value === "inPerson") {
          setMeetingUrl("");
          setErrors((prevErrors) => ({ ...prevErrors, meetingUrl: "" }));
        }
        break;
      case "template":
        setTemplate(value);
        if (errors.template) {
          setErrors((prevErrors) => ({ ...prevErrors, template: "" }));
        }
        break;
      case "meetingUrl":
        setMeetingUrl(value);
        if (errors.meetingUrl) {
          setErrors((prevErrors) => ({ ...prevErrors, meetingUrl: "" }));
        }
        if (value === "") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            meetingUrl: "Meeting URL is required",
          }));
        }
        break;
      default:
        break;
    }
  };
  const addAudioElement = async (blob) => {
    // Clear existing audio elements
    if (audioDivRef.current) {
      audioDivRef.current.innerHTML = ""; // Remove all previous audio elements
    }

    // Create a new audio element
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;

    // Append the new audio element
    if (audioDivRef.current) {
      audioDivRef.current.appendChild(audio);
    }

    // Prepare form data for upload
    const formData = new FormData();
    formData.append("file", blob, "audio.mp3");
    formData.append("templateId", template);
    formData.append("userId", userData.id);
    formData.append("clientName", clientName);
    formData.append("clientGender", gender);

    // Upload audio
    setLoading(true);
    try {
      const response = await axiosRequest.post("/audio/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTranscription(response.data.audio.transcription);
      setSelectedClientRecord(response.data.audio);
      setNonSelectedTemplates(
        templates.filter((currentTemplate) => {
          return currentTemplate.id !== template;
        })
      );
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextClient = async () => {
    if (type === "online") {
      await axiosRequest
        .post("/clientRecord/stop-recording", {
          botId,
        })
        .then((res) => {
          console.log(res.data);
          setClientName("");
          setBotId(null);
          setGender("");
          setType("inPerson");
          setTemplate();
          setMeetingUrl("");
          setClientConcent(false);
          setOnlineTranscription([]);
          setErrors({});
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setClientName("");
      setGender("");
      setType("inPerson");
      setTemplate();
      setMeetingUrl("");
      setClientConcent(false);
      setErrors({});
      // Clear audio elements
      if (audioDivRef.current) {
        while (audioDivRef.current.firstChild) {
          audioDivRef.current.removeChild(audioDivRef.current.firstChild);
        }
      }

      if (recorderControls.isRecording) {
        recorderControls.stopRecording();
      }
    }
    // Clear all form fields
  };
  const converter = new Showdown.Converter();

  useEffect(() => {
    axiosRequest
      .post("/template/getAll", { userId: userData.id })
      .then((res) => {
        setTemplates(res.data.templates);
        setTemplate(res.data.templates[0].id);
      });
  }, []);

  const handleOnlineMeeting = () => {
    axiosRequest
      .post("/clientRecord/add-and-start", {
        clientName,
        meetingUrl,
        userId: userData.id,
        templateId: template,
      })
      .then((res) => {
        const newBotId = res.data.botId;
        setBotId(newBotId);
        setSelectedClientRecord(res.data.clientRecord);
        setNonSelectedTemplates(
          templates.filter((currentTemplate) => {
            console.log(currentTemplate.id);
            console.log(template);
            return currentTemplate.id !== template;
          })
        );
        if (!socket) {
          const newSocket = io(import.meta.env.VITE_BACKEND);
          setSocket(newSocket);
        }
      });
  };

  useEffect(() => {
    if (socket && botId) {
      socket.emit("joinBot", botId.toString());

      // Listen for transcriptionAdded events
      socket.on("transcriptionAdded", (data) => {
        // Update the transcription state
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

  const [editorContents, setEditorContents] = useState({});
  const [selectedTabs, setSelectedTabs] = useState({});
  const [nonSelectedTemplates, setNonSelectedTemplates] = useState([]);
  const [selectedClientRecord, setSelectedClientRecord] = useState({});
  const handleAddTemplate = (templateId) => {
    axiosRequest
      .post("/clientrecord/add-template", {
        templateId,
        clientRecordId: selectedClientRecord._id,
      })
      .then((res) => {
        setSelectedClientRecord(res.data.clientRecord);
        setOnlineTranscription(res.data.clientRecord.transcript);
        setEditorContents((prev) => ({
          ...prev,
          [templateId]: res.data.clientRecord.notes.find(
            (note) => note.templateId === templateId
          )?.noteContent,
        }));
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
        clientRecordId: selectedClientRecord._id,
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
      <div className="flex flex-col">
        <div className="flex flex-wrap justify-between bg-[#FAFAFA] h-auto min-h-[72px] items-center px-[70px]">
          <div className="flex flex-wrap gap-[10px]">
            <div className="flex flex-col">
              <Input
                placeholder="Client name"
                value={clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                className="w-[150px]"
                status={errors.clientName && "error"}
              />
              {errors.clientName && (
                <span className="text-red-500 text-[12px]">
                  {errors.clientName}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <Select
                placeholder="Sex"
                style={{ width: 90 }}
                value={gender}
                onChange={(value) => handleChange("gender", value)}
                options={[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "neutral", label: "Neutral" },
                ]}
                status={errors.gender && "error"}
              />
              {errors.gender && (
                <span className="text-red-500 text-[12px]">
                  {errors.gender}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <Select
                placeholder="In Person"
                style={{ width: 120 }}
                value={type}
                onChange={(value) => handleChange("type", value)}
                options={[
                  { value: "inPerson", label: "In Person" },
                  { value: "online", label: "Online" },
                ]}
                status={errors.type && "error"}
              />
              {errors.type && (
                <span className="text-red-500 text-[12px]">{errors.type}</span>
              )}
            </div>
            <div className="flex flex-col">
              {" "}
              <Select
                placeholder="Default template"
                style={{ width: 120 }}
                value={template}
                onChange={(value) => handleChange("template", value)}
                options={[
                  ...templates.map((temp) => ({
                    value: temp.id,
                    label: temp.templateTitle,
                  })),
                ]}
                status={errors.template && "error"}
              />
              {errors.template && (
                <span className="text-red-500 text-[12px]">
                  {errors.template}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              {type === "online" && (
                <Input
                  placeholder="Meeting URL"
                  value={meetingUrl}
                  onChange={(e) => handleChange("meetingUrl", e.target.value)}
                  className="w-[150px]"
                  status={errors.meetingUrl && "error"}
                />
              )}
              {errors.meetingUrl && (
                <span className="text-red-500 text-[12px]">
                  {errors.meetingUrl}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-[10px]">
            <Button type="default" className="h-[35px]" icon={<SaveOutlined />}>
              Save Client for Future
            </Button>
            {type === "online" ? (
              clientConcent && botId ? (
                <div
                  onClick={handleNextClient}
                  className="cursor-pointer flex h-[35px] items-center gap-[10px] rounded bg-[black] px-[20px] text-[white]"
                >
                  <span>Next Client</span>
                  <ChevronRight />
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (recorderControls.isRecording) {
                      recorderControls.stopRecording();
                    } else {
                      onFinish();
                    }
                  }}
                  className="cursor-pointer flex h-[35px] items-center gap-[10px] rounded bg-[#1333A7] px-[20px] text-[white]"
                >
                  <PlayIcon />
                  <span>
                    {recorderControls.isRecording
                      ? "Stop meeting"
                      : "Start meeting"}{" "}
                  </span>
                </div>
              )
            ) : (
              <div
                onClick={() => {
                  if (recorderControls.isRecording) {
                    recorderControls.stopRecording();
                  } else {
                    onFinish();
                  }
                }}
                className="cursor-pointer flex h-[35px] items-center gap-[10px] rounded bg-[#1333A7] px-[20px] text-[white]"
              >
                <PlayIcon />
                <span>
                  {recorderControls.isRecording
                    ? "Stop Recording"
                    : "Start Recording"}{" "}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Get consent from your client before recording."
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <div className="flex w-full gap-5">
            <div
              onClick={handleCancel}
              className="cursor-pointer w-full border rounded-md bg-[white] border-black text-[16px] flex items-center justify-center h-[45px]"
            >
              No
            </div>
            <div
              onClick={() => {
                setIsModalOpen(false);
                setClientConcent(true);
                if (audioDivRef.current) {
                  audioDivRef.current.innerHTML = ""; // Remove all previous audio elements
                }

                if (type === "online") {
                  handleOnlineMeeting();
                } else {
                  recorderControls.startRecording();
                }
              }}
              className="cursor-pointer w-full relative font-medium text-[white] rounded-md bg-[#1333A7] text-[16px] flex items-center justify-center h-[45px]"
            >
              Yes, begin
              <span className="absolute bottom-0 right-2 opacity-80 text-[14px]">
                Enter
              </span>
            </div>
          </div>,
        ]}
      >
        <p>All transcription are encrypted.</p>
        <p>All recording are immediately deleted post transcription.</p>
        <p>Only you own and have access to the data.</p>
        <p>Delete any time.</p>
      </Modal>
      {clientConcent && (
        <div>
          {type === "inPerson" && (
            <div className="flex items-center gap-[20px] justify-center">
              <AudioRecorder
                onRecordingComplete={(blob) => {
                  addAudioElement(blob);
                }}
                recorderControls={recorderControls}
                downloadOnSavePress={true}
                downloadFileExtension="mp3"
                showVisualizer={true}
              />
              {!recorderControls.isRecording && <div ref={audioDivRef}></div>}
            </div>
          )}

          {type === "inPerson" && (
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
                          {recorderControls.isRecording ? (
                            <span>Finish recording to get transcript</span>
                          ) : loading ? (
                            <div className="flex items-center justify-center">
                              <Spin
                                indicator={
                                  <LoadingOutlined
                                    style={{ fontSize: 24 }}
                                    spin
                                  />
                                }
                              />
                            </div>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: converter.makeHtml(transcription),
                              }}
                              className="py-2 z-1 text-normal min-h-[150px] overflow-auto text-labelSubText text-[11px] leading-[180%] w-[90%] relative"
                            ></div>
                          )}
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

          {type === "online" && (
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

export default Consult;
