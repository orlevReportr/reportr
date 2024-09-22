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
import MoreIcon from "../../../icons/DeleteIcon";
import PenIcon from "../../../icons/PenIcon";
import DuplicateIcon from "../../../icons/DuplicateIcon";
import DefaultIcon from "../../../icons/DefaultIcon";
import { DeleteOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { message } from "antd";

function ReportrAITemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const converter = new Showdown.Converter();
  const userData = UserData();

  const handleDuplicateTemplate = (template) => {
    const { content, templateTitle } = template;
    axiosRequest
      .post("/template/add", {
        content,
        templateTitle: `${templateTitle} duplicate`,
        userId: userData.id,
      })
      .then((res) => {
        showtoast("success", "Template duplicated successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axiosRequest
      .get("/template/get")
      .then((res) => {
        setTemplates(res.data.templates);
      })
      .catch((err) => {});
  }, []);
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
  return (
    <BaseLayout>
      <CustomizeLayout>
        <div className="p-[30px] w-full">
          <h1 className="text-3xl text-[#373737] font-medium">
            Reportr AI Templates
          </h1>
          <span className="text-[#373737] opacity-90 text-[15px]">
            Check Reportr AI templates
          </span>
          <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5 mt-2">
            {templates &&
              templates.map((template) => (
                <div key={template.id} className="relative">
                  <div
                    className="absolute top-3 right-3 text-lg z-50"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <div slot="actionIcons">
                      <span className="relative">
                        <button className="px-2 p-1 h-full flex rounded-[5px] border-r border-gray-300 justify-center items-center pr-2 hover:bg-[#f2f2f2]">
                          <DuplicateIcon />
                        </button>
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsModalOpen(true);
                    }}
                    className="w-full h-[260px] border-none cursor-pointer bg-transparent rounded-[6px] flex flex-col shadow-[0_2px_4px_rgba(15,15,15,0.1)] relative comment-container group"
                  >
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

        {selectedTemplate && (
          <Modal open={isModalOpen} onCancel={handleCancel} footer={null}>
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col items-start">
                <label htmlFor="templateTitle">Template Title</label>
                <span className="text-[20px] font-medium">
                  {selectedTemplate.templateTitle}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <label htmlFor="templateTitle">Template Content</label>
                <div
                  dangerouslySetInnerHTML={{
                    __html: converter.makeHtml(selectedTemplate.content),
                  }}
                  className="py-2 z-1 text-normal text-labelSubText text-[14px] leading-[180%] w-[90%] relative overflow-clip"
                ></div>
              </div>
            </div>
          </Modal>
        )}
      </CustomizeLayout>
      {contextHolder}
    </BaseLayout>
  );
}

export default ReportrAITemplates;
