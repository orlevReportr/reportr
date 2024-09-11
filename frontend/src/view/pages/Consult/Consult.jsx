import React, { useState } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { Button, Input, Modal, Select } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import PlayIcon from "../../icons/PlayIcon";

function Consult() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <BaseLayout>
      <div className="flex flex-col">
        <div className="flex justify-between bg-[#FAFAFA] h-[72px] items-center px-[70px]">
          <div className="flex gap-[10px]">
            <Input placeholder="Patient name" className="w-[150px]" />
            <Select
              placeholder="Sex"
              style={{ width: 90 }}
              onChange={(val) => {}}
              options={[
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
                { value: "neutral", label: "Neutral" },
              ]}
            />{" "}
            <Select
              placeholder="In Person"
              style={{ width: 120 }}
              onChange={(val) => {}}
              options={[
                { value: "inPerson", label: "In Person" },
                { value: "online", label: "Online" },
              ]}
            />{" "}
            <Select
              placeholder="Default template"
              style={{ width: 120 }}
              onChange={(val) => {}}
              options={[
                { value: "inPerson", label: "In Person" },
                { value: "online", label: "Online" },
              ]}
            />{" "}
          </div>

          <div className="flex gap-[10px]">
            <Button type="default" className="h-[35px]" icon={<SaveOutlined />}>
              Save Client for Future
            </Button>
            <div
              onClick={showModal}
              className="cursor-pointer flex h-[35px] items-center gap-[10px] rounded bg-[#1333A7] px-[20px] text-[white]"
            >
              <PlayIcon />
              <span>Start recording</span>
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Get consent from your client before reconding."
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <div className="flex  w-full gap-5">
            <div className="cursor-pointer w-full border rounded-md bg-[white] border-black text-[16px] flex items-center justify-center h-[45px]">
              No
            </div>
            <div className="cursor-pointer w-full relative font-medium text-[white] rounded-md bg-[#1333A7] text-[16px] flex items-center justify-center h-[45px]">
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
    </BaseLayout>
  );
}

export default Consult;
