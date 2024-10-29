import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import store from "./redux/store";
import { jwtDecode } from 'jwt-decode'; 
import { logout } from "./redux/slices/authSlice";
import { PermissionsProvider } from "./utils/PermissionsContext"; 
import "./index.css";
import { DragDropContext } from 'react-beautiful-dnd';

const queryClient = new QueryClient();

const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsedUserInfo = JSON.parse(userInfo);
      return parsedUserInfo.token;
    } catch (error) {
      console.error("Error parsing userInfo:", error);
      return null;
    }
  }
  return null;
};

const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000; 
  } catch (error) {
    return true;
  }
};

const TokenHandler = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const token = getToken();

    if (token) {
      if (isTokenExpired(token)) {
        dispatch(logout());
      } else {
        console.log("Token is valid.");
      }
    } else {
      console.log("No token found.");
    }
  }, [dispatch]);

  return null;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* <React.StrictMode> */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TokenHandler />
          <PermissionsProvider>
          <DragDropContext>
              <App />
          </DragDropContext>
          </PermissionsProvider>
        </BrowserRouter>
      </QueryClientProvider>
    {/* </React.StrictMode> */}
  </Provider>
);
