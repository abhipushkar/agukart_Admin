import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PageExpired = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Reset password token page is expired</h1>
      <a onClick={() => navigate(ROUTE_CONSTANT.login)} style={{cursor: "pointer"}}>Go back to login page</a>
    </div>
  );
};

export default PageExpired;
