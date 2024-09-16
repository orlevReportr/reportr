import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserData } from "../../utils/UserData";
import axiosRequest from "../../utils/AxiosConfig";

const OAuthCallback = () => {
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const userData = UserData();
  useEffect(() => {
    if (code) {
      axiosRequest
        .post("/oauth/callback", {
          code,
          calendarId: userData.calendarId,
          userId: userData.id,
        })
        .then((response) => {
          navigate("/consult");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [userData.id]);

  return <div>Logging you in...</div>;
};

export default OAuthCallback;
