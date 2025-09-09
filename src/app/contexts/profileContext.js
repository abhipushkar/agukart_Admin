import { apiEndpoints } from "app/constant/apiEndpoints";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageKey } from "app/constant/localStorageKey";
const profileContext = createContext("");

export const useProfileData = () => {
  return useContext(profileContext);
};

const ProfileContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [logUserData, setLogUserData] = useState({});

  const getProfileData = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getProfile, localStorage.getItem(localStorageKey.auth_key));
      if (res.status === 200) {
        setLogUserData(res?.data?.data);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        navigate(ROUTE_CONSTANT.login);
      }
    }
  };

  useEffect(()=>{
    getProfileData();
  },[])

  return (
    <profileContext.Provider value={{ logUserData, setLogUserData,getProfileData }}>
      {children}
    </profileContext.Provider>
  );
};

export default ProfileContextProvider;
