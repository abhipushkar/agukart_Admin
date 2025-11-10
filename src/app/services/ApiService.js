import axios from "axios";
import { toast } from "react-toastify";
// import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import {BASE_URL,LOGIN_BASE_URL} from "../../config.js";

export const ApiService = {
  post: async (url, data, accessToken) => {
    try {
      const res = await axios.post(`${BASE_URL}/${url}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json"
        }
      });
      return res;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }
      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },
    put: async (url, data, accessToken) => {
    try {
      const res = await axios.put(`${BASE_URL}/${url}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json"
        }
      });
      return res;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }
      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },

  login: async (url, data, accessToken) => {
    try {
      const res = await axios.post(`${LOGIN_BASE_URL}/${url}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json"
        }
      });
      return res;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }
      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },
  postImage: async (url, data, accessToken) => {
    try {
      const res = await axios.post(`${BASE_URL}/${url}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data"
        }
      });
      return res;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }
      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },

  get: async (resource, accessToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/${resource}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }

      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },

  getWithoutAuth: async (resource, accessToken) => {
    try {
      const response = await axios.get(`${LOGIN_BASE_URL}/${resource}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }

      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  },

  delete: async (resource, accessToken) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${resource}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response;
    } catch (error) {
      if (!error) {
        toast.error("Somthing Went Wrong ");
        return;
      }

      if (!error?.response?.data?.message) {
        toast.error(error?.message);
      }
      toast.error(error?.response?.data?.message);
      throw error;
    }
  }
};
