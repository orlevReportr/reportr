import React, { useEffect, useState } from "react";
import BaseLayout from "../../../layouts/BaseLayout";
import CustomizeLayout from "../../../layouts/CustomizeLayout";
import PlustIcon from "../../../icons/PlustIcon";
import { Button, Input, Modal, Popover } from "antd";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css"; // Import editor styles
import axiosRequest from "../../../../utils/AxiosConfig";
import { UserData } from "../../../../utils/UserData";
import DeleteIcon from "../../../icons/DeleteIcon";
import MoreIcon from "../../../icons/DeleteIcon";
import PenIcon from "../../../icons/PenIcon";
import DuplicateIcon from "../../../icons/DuplicateIcon";
import DefaultIcon from "../../../icons/DefaultIcon";
import { DeleteOutlined } from "@ant-design/icons";
import { format } from "date-fns";

function YourTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [selectedTab, setSelectedTab] = useState("write");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templates, setTemplates] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setTemplateTitle("");
    setEditorContent("");
  };

  const handleOk = () => {
    const request = isEditMode
      ? axiosRequest.post(`/template/edit/${editingTemplateId}`, {
          content: editorContent,
          templateTitle,
          userId: userData.id,
        })
      : axiosRequest.post("/template/add", {
          content: editorContent,
          templateTitle,
          userId: userData.id,
        });

    request.then((res) => {
      if (isEditMode) {
        setTemplates(
          templates.map((template) =>
            template.id === editingTemplateId ? res.data.template : template
          )
        );
      } else {
        setTemplates([...templates, res.data.template]);
      }
      setIsModalOpen(false);
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (template) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditingTemplateId(template.id);
    setTemplateTitle(template.templateTitle);
    setEditorContent(template.content);
  };

  const converter = new Showdown.Converter();
  const userData = UserData();
  useEffect(() => {
    axiosRequest
      .post("/template/get", {
        userId: userData.id,
      })
      .then((res) => {
        setTemplates(res.data.templates);
      })
      .catch((err) => {});
  }, []);

  return (
    <BaseLayout>
      <CustomizeLayout>
        <div className="p-[30px] w-full">
          <h1 className="text-3xl text-[#373737] font-medium">
            Your Templates
          </h1>
          <span className="text-[#373737] opacity-90 text-[15px]">
            Create or upload a custom template
          </span>
          <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5 mt-2">
            <div
              onClick={showModal}
              className="w-full h-[260px] relative flex flex-col rounded-[6px] border border-bgBorder p-1 items-center justify-center gap-4 bg-white hover:cursor-pointer hover:shadow-[0_1px_2px_#0003,inset_0_0_50px_0_rgba(165,182,244,0.2)]"
            >
              <div className="py-1 w-[150px] rounded-md flex items-center justify-center cursor-pointer">
                <div className="p-2 rounded-full bg-[#00000002] border border-[#00000014]">
                  <PlustIcon />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <h2 className="font-medium mb-1 text-center">
                  Create a new note template
                </h2>
                <p className="font-normal text-sm opacity-75 text-[#373737] text-center">
                  Build a new template to use in Reportr AI
                </p>
              </div>
            </div>

            {templates &&
              templates.map((template) => (
                <div key={template.id}>
                  <div className="w-full h-[260px] border-none cursor-pointer bg-transparent rounded-[6px] flex flex-col shadow-[0_2px_4px_rgba(15,15,15,0.1)] relative comment-container group">
                    <div className="top-half bg-white w-full h-full flex flex-col p-4 relative rounded-t-[6px] border-l border-t border-r border-bgBorder group-hover:bg-[#f8f8f8] duration-[140ms]">
                      <div className="flex items-center">
                        <div className="flex flex-col text-labelTitle w-full">
                          <div className="relative">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: converter.makeHtml(template.content),
                              }}
                              className="py-2 z-1 text-normal h-[150px] text-labelSubText text-[11px] leading-[180%] w-[90%] relative overflow-clip"
                            ></div>
                            <div className="absolute bottom-0 left-0 right-0 h-16 z-1"></div>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 text-lg">
                          <div slot="actionIcons">
                            <div
                              className="flex items-center btn-container rounded-[6px] border border-gray-300 bg-white text-[#373737] shadow-sm"
                              id="options-note-template"
                            >
                              <span className="relative">
                                <button
                                  className="px-2 p-1 h-full flex rounded-l-[5px] rounded-r-none border-r border-gray-300 justify-center items-center pr-2 hover:bg-[#f2f2f2]"
                                  onClick={() => handleEdit(template)}
                                >
                                  <PenIcon />
                                </button>
                              </span>
                              <div className="relative">
                                <span className="relative">
                                  <Popover
                                    style={{ padding: 0 }}
                                    content={
                                      <div className="flex flex-col gap-[10px]">
                                        <div className="flex gap-[5px] cursor-pointer p-[5px] hover:bg-gray-200 rounded items-center">
                                          <DefaultIcon />
                                          <span>Set default</span>
                                        </div>

                                        <div className="flex gap-[5px] cursor-pointer p-[5px] hover:bg-gray-200 rounded items-center">
                                          <DuplicateIcon />
                                          <span>Duplicate</span>
                                        </div>

                                        <div
                                          onClick={() => {
                                            axiosRequest
                                              .post("/template/delete", {
                                                templateId: template.id,
                                              })
                                              .then((res) => {
                                                setTemplates(
                                                  templates.filter(
                                                    (t) => t.id !== template.id
                                                  )
                                                );
                                              });
                                          }}
                                          className="flex gap-[5px] cursor-pointer p-[5px] hover:bg-gray-200 rounded items-center"
                                        >
                                          <DeleteOutlined className="text-[red]" />
                                          <span className="text-[red]">
                                            Delete
                                          </span>
                                        </div>
                                      </div>
                                    }
                                    trigger="click"
                                    placement="bottom"
                                  >
                                    <button className="p-1 h-full max-w-[30px] flex rounded-r-[5px] rounded-l-none border-gray-300 justify-center items-center hover:bg-[#f2f2f2]">
                                      <MoreIcon />
                                    </button>
                                  </Popover>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col w-full flex-grow bg-[#fbfbfb] h-[90px] z-10 py-2 px-4 rounded-b-[6px] border border-bgBorder group-hover:bg-[#f8f8f8] duration-[140ms]">
                      <span className="flex items-start font-semibold text-[17px] mb-4 truncate">
                        {template.templateTitle}
                      </span>
                      <div className="flex flex-row items-center font-normal text-[12px] text-labelSubText">
                        <span className="flex">
                          Edited at{" "}
                          {format(new Date(template.updatedAt), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <Modal
          title={isEditMode ? "Edit Template" : "Create Template"}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={isEditMode ? "Update" : "Create"}
        >
          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col items-start">
              <label htmlFor="templateTitle">Template Title</label>
              <Input
                value={templateTitle}
                onChange={(e) => {
                  setTemplateTitle(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col items-start">
              <label htmlFor="templateTitle">Template Content</label>
              <ReactMde
                value={editorContent}
                onChange={setEditorContent}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                  Promise.resolve(converter.makeHtml(markdown))
                }
              />
            </div>
          </div>
        </Modal>
      </CustomizeLayout>
    </BaseLayout>
  );
}

export default YourTemplates;
