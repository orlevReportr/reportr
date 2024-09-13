import React, { useEffect, useState } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { Button, Input, Modal, Select } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import PlayIcon from "../../icons/PlayIcon";
import axiosRequest from "../../../utils/AxiosConfig";
import { UserData } from "../../../utils/UserData";
import { AudioRecorder } from "react-audio-voice-recorder";
import { useAudioRecorder } from "react-audio-voice-recorder";
import ChevronRight from "../../icons/ChevronRight";
import * as Showdown from "showdown";

function Consult() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const userData = UserData();

  // State for each form field
  const [clientName, setClientName] = useState("");
  const [gender, setGender] = useState("");
  const [type, setType] = useState("inPerson");
  const [template, setTemplate] = useState();
  const [meetingUrl, setMeetingUrl] = useState("");
  const [clientConcent, setClientConcent] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const recorderControls = useAudioRecorder({}, (err) => console.table(err));
  const [errors, setErrors] = useState({});

  const audioDivRef = React.useRef();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

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
      console.log(response.data.audio.transcription);
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextClient = () => {
    // Clear all form fields
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
        console.log("clearing");
        audioDivRef.current.removeChild(audioDivRef.current.firstChild);
      }
    } else {
      console.log("Audio div reference doesn't exist");
    }

    // Stop any ongoing recording
    if (recorderControls.isRecording) {
      recorderControls.stopRecording();
    }
  };
  const converter = new Showdown.Converter();

  useEffect(() => {
    axiosRequest.post("/template/get", { userId: userData.id }).then((res) => {
      setTemplates(res.data.templates);
    });
  }, []);

  return (
    <BaseLayout>
      <div className="flex flex-col">
        <div className="flex justify-between bg-[#FAFAFA] h-[72px] items-center px-[70px]">
          <div className="flex gap-[10px]">
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
                  // { value: "default", label: "Default template" },
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
            {clientConcent && !recorderControls.isRecording ? (
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
                    ? "Stop recording"
                    : "Start recording"}{" "}
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

                recorderControls.startRecording();
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

          <div className="w-full h-full mt-4 md:mt-10 flex flex-col items-center svelte-ur6agj">
            {" "}
            <div className="w-[90%] md:w-[70%] svelte-ur6agj">
              <div className="w-full relative">
                <div className="flex w-full relative overflow-x-hidden border-t-2 px-2 rounded-t-md bg-white border-x-2 items-center gap-[6px] text-sm -mt-[32px]">
                  <button className="truncate div-container duration-75 hover:text-primary h-full px-2 py-[5.5px] flex items-center gap-2 active-tab-notes svelte-1qdq97v">
                    {" "}
                    <p className="text-fade font-medium overflow-hidden text-[13px]">
                      Transcript
                    </p>
                  </button>{" "}
                  <span className="h-[12px] border-[0.5px] border-[#D0D5DD]"></span>
                  <button className="truncate div-container duration-75 hover:text-primary h-full px-2 py-[5.5px] flex items-center gap-2 text-[#667085] svelte-1qdq97v">
                    {" "}
                    <p className="text-fade font-medium overflow-hidden text-[13px]">
                      Template: {template}
                    </p>
                  </button>{" "}
                </div>{" "}
                <div className="bottom-0 -mb-[1.8px] z-[5] absolute left-0 h-[2px] bg-secondary svelte-1qdq97v"></div>
              </div>
            </div>{" "}
            <div className="w-[90%] md:w-[70%] h-[70%] max-h-[600px] svelte-ur6agj">
              <div className="flex w-full max-h-[600px] h-full svelte-1atycu8">
                <div
                  className="bg-white relative flex-col justify-between w-full h-full overflow-hidden max-h-[600px] border-2 resize-none rounded-b-md p-4 focus:outline-none svelte-1atycu8"
                  id="note-pad-container"
                >
                  <div className="text-[#BABABA] svelte-1atycu8">
                    {recorderControls.isRecording ? (
                      <span>Finish recording to get transcript</span>
                    ) : loading ? (
                      <span>Loading</span>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: converter.makeHtml(transcription),
                        }}
                        className="py-2 z-1 text-normal h-[150px] text-labelSubText text-[11px] leading-[180%] w-[90%] relative overflow-clip"
                      ></div>
                    )}
                  </div>{" "}
                </div>
              </div>
            </div>{" "}
          </div>
        </div>
      )}
    </BaseLayout>
  );
}

export default Consult;
