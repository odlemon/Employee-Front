import React, { createContext, useContext, useState, useEffect } from "react";

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo && userInfo.permissions) {
    
      const activePermissions = userInfo.permissions
        .filter(permission => permission.value) 
        .map(permission => permission.name);    

      console.log("Active Permissions from userInfo:", activePermissions);

      setPermissions(activePermissions);
    }
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, setPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};
