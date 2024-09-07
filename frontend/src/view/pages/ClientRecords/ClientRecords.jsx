import React, { useEffect, useState } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { Popover, Table } from "antd";
import axiosRequest from "../../../utils/AxiosConfig";
import { UserData } from "../../../utils/UserData";
import { formatDate } from "../../../utils/helpers";
import {
  CalendarOutlined,
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  FontColorsOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import SortIcon from "../../icons/SortIcon";
const columns = [
  {
    title: "Client Name",
    dataIndex: "clientName",
  },
  {
    title: "Consultation Date",
    dataIndex: "createdAt",
    render: (text) => <span>{formatDate(text)}</span>,
  },
  {
    title: "",
    dataIndex: "",
    render: () => (
      <div className="flex gap-[30px] items-end justify-end">
        <div className="flex gap-[10px] text-[red] cursor-pointer">
          <DeleteOutlined />
          <span>Delete</span>
        </div>
        <div className="flex gap-[10px] text-[#949cbe] cursor-pointer">
          <ExportOutlined /> <span>Review</span>
        </div>
      </div>
    ),
  },
];

function ClientRecords() {
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {},
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      name: record.name,
    }),
  };
  const userData = UserData();

  const [clientRecords, setClientRecords] = useState([]);
  useEffect(() => {
    axiosRequest
      .post("/clientRecord/get", {
        userId: userData.id,
      })
      .then((res) => {
        setClientRecords(res.data.clientRecords);
      });
  }, []);
  const [isSearchVisible, setSearchVisible] = useState(false); // State to manage search input visibility

  const toggleSearchInput = () => {
    setSearchVisible(!isSearchVisible); // Toggle search input visibility
  };
  const handleSort = (sortField) => {
    const sortedRecords = [...clientRecords].sort((a, b) =>
      a[sortField].localeCompare(b[sortField])
    );
    setClientRecords(sortedRecords);
  };

  const sortOptions = (
    <div className="flex flex-col gap-[10px]">
      <div
        className="flex gap-[5px] cursor-pointer p-[5px] hover:bg-gray-200 rounded"
        onClick={() => handleSort("createdAt")}
      >
        <CalendarOutlined />
        <span>Consult Date</span>
      </div>

      <div
        className="flex gap-[5px] cursor-pointer p-[5px] hover:bg-gray-200 rounded"
        onClick={() => handleSort("clientName")}
      >
        <FontColorsOutlined />
        <span>Client Name</span>
      </div>
    </div>
  );

  return (
    <BaseLayout>
      <div className="flex flex-col py-[30px] px-[70px]">
        <div className="flex justify-between">
          <div className="flex flex-col gap-[10px]">
            <h1 className="text-[24px]">Client Records</h1>
            <span className="text-[13px]">
              Manage all of your client records
            </span>
          </div>
          <div className="cursor-pointer flex h-[35px] items-center gap-[10px] rounded bg-[#1333A7] px-[20px] text-[white]">
            <PlusOutlined />
            <span>Add Client</span>
            <DownOutlined />
          </div>
        </div>
        <div className="flex justify-end gap-[10px]">
          <div className="relative flex items-center">
            <SearchOutlined
              onClick={toggleSearchInput}
              className="cursor-pointer"
            />
            <input
              type="text"
              className={`transition-all duration-300 ease-in-out bg-white outline-none ${
                isSearchVisible ? "w-[200px] ml-[10px]" : "w-0"
              }`}
              style={{ opacity: isSearchVisible ? 1 : 0 }}
              placeholder="Search..."
            />
          </div>
          <Popover
            style={{ padding: 0 }}
            content={sortOptions}
            trigger="click"
            placement="bottom"
          >
            <div className="flex items-center text-[13px] gap-[5px] cursor-pointer">
              <SortIcon />
              <span>Sort by</span>
            </div>
          </Popover>
        </div>
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          columns={columns}
          dataSource={clientRecords}
        />
      </div>
    </BaseLayout>
  );
}

export default ClientRecords;
