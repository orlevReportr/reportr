import React, { useEffect, useState } from "react";
import { Input, Button, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { UserData } from "../../../utils/UserData";
import axiosRequest from "../../../utils/AxiosConfig";

function Login() {
  const [buttonLoading, setButtonLoading] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  const handleLoginButton = () => {
    setButtonLoading(true);

    axiosRequest("/user/login", {
      email,
      password,
    })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setButtonLoading(false);
        navigate("/consult");
      })
      .catch((e) => {
        showtoast("error", "Wrong Credentials");
      })
      .finally(() => {
        setButtonLoading(false);
      });
  };

  const [passwordVisible, setPasswordVisible] = React.useState(false);

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
  const userData = UserData();
  useEffect(() => {
    if (userData) {
      navigate("/consult");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <div className="login-container">
        <div>
          <img src="../assets/logo.png" width={"100%"}></img>
        </div>
        <span>Welcome back!</span>
        <br></br>

        <div style={{ width: "100%" }}>
          <label>Email:</label>
          <Input
            placeholder="Email"
            prefix={<UserOutlined />}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <br></br>
        <div style={{ width: "100%" }}>
          <label>Password:</label>
          <Input.Password
            placeholder="Password"
            prefix={<LockOutlined />}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </div>
        <br></br>
        <div style={{ alignSelf: "end" }}>
          <span
            style={{
              color: "var(--primary-color)",
              textDecoration: "underline",
            }}
          >
            Forgot password?
          </span>
        </div>
        <br></br>
        <div style={{ width: "100%" }}>
          <Button
            type="primary"
            style={{ width: "100%" }}
            loading={buttonLoading}
            onClick={handleLoginButton}
          >
            Login
          </Button>
        </div>
        <br></br>
        <div>
          <span style={{ color: "grey" }}>
            No account?{" "}
            <span
              style={{ color: "#1677FF", cursor: "pointer" }}
              onClick={() => {
                navigate("/signup");
              }}
            >
              Sign up
            </span>
          </span>
        </div>
      </div>
      {contextHolder}
    </div>
  );
}

export default Login;
