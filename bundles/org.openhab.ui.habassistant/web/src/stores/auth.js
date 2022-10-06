import { defineStore } from "pinia";
import axios from "axios";
import { useAssistantStore } from "./assistant";
export const useAuthStore = defineStore("auth", () => {
  const { renewToken } = useAssistantStore();
  let token = "";
  function setAccessToken(accessToken) {
    token = accessToken;
    renewToken(accessToken);
  }
  function clearAccessToken() {
    token = null;
  }
  function getAccessToken() {
    return token;
  }
  let refreshAccessTokenTimeoutRef = null;
  function getRefreshToken() {
    return localStorage.getItem("openhab.ui:refreshToken") || null;
  }
  function setRefreshToken(refreshToken) {
    localStorage.setItem("openhab.ui:refreshToken", refreshToken);
  }
  async function isTokenRequired() {
    let requireToken = true;
    // determine whether the token is required for user operations
    await axios
      .get("/rest/habassistant/config")
      .then((resp) => {
        requireToken = resp.data.secure;
      })
      .catch((err) => {
        if (err === "Unauthorized" || err === 401) requireToken = true;
        return Promise.resolve();
      });
    return requireToken;
  }
  function unauthorized() {
    const mainUrl = document.location.origin;
    console.debug("Unauthorized, redirecting to main url: " + mainUrl);
    if (!import.meta.env.DEV) {
      window.location = document.location.origin.toString();
    } else {
      console.warn("Redirection disabled in dev mode");
    }
  }
  async function refreshAccessToken() {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }
      const payloadObj = {
        grant_type: "refresh_token",
        client_id: window.location.origin,
        redirect_uri: window.location.origin,
        refresh_token: refreshToken,
      };
      const payload = Object.entries(payloadObj).reduce(
        (text, [key, value]) => {
          if (text.length) text = `${text}&`;
          text = `${text}${encodeURIComponent(key)}=${encodeURIComponent(
            value
          )}`;
          return text;
        },
        ""
      );
      clearAccessToken();
      const resp = await axios.post("/rest/auth/token", payload, {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
      });
      setAccessToken(resp.data.access_token);
      setRefreshToken(resp.data.refresh_token);
      if (refreshAccessTokenTimeoutRef)
        clearTimeout(refreshAccessTokenTimeoutRef);
      refreshAccessTokenTimeoutRef = setTimeout(
        refreshAccessToken,
        resp.data.expires_in * 950
      );
      document.removeEventListener("visibilitychange", refreshAccessToken);
      document.addEventListener("visibilitychange", refreshAccessToken);
    } catch (error) {
      console.error(error);
      unauthorized();
    }
  }
  return { isTokenRequired, getAccessToken, refreshAccessToken };
});
