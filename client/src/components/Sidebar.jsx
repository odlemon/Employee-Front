import React, { useState } from "react";
import clsx from "clsx";
import { FaTasks, FaTrashAlt, FaUsers, FaProjectDiagram } from "react-icons/fa";
import {
  MdDashboard,
  MdTableChart,
  MdOutlinePendingActions,
  MdTaskAlt,
  MdSettings,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import logo from "../assets/logo.png";
import BranchProgressModal from "./BranchProgressModal";
import { usePermissions } from "../utils/PermissionsContext";

const linkData = [
  {
    label: "Organization Overview",
    link: "/overview",
    icon: <MdTableChart />,
    permission: "can access organisation dashboard", // Required permission
  },
  {
    label: "Dashboard",
    link: "/dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Objectives",
    link: "/tasks",
    icon: <FaTasks />,
    permission: "can view tasks",
  },
  {
    label: "Completed",
    link: "/completed/completed",
    icon: <MdTaskAlt />,
    permission: "can view tasks",
  },
  {
    label: "In Progress",
    link: "/in-progress/in progress",
    icon: <MdOutlinePendingActions />,
    permission: "can view tasks",
  },
  {
    label: "To Do",
    link: "/todo/todo",
    icon: <MdOutlinePendingActions />,
    permission: "can view tasks",
  },
  {
    label: "Branch Progress",
    link: "/team",
    icon: <FaProjectDiagram />,
    permission: "can update branch progress",
  },
  {
    label: "Employees",
    link: "/team",
    icon: <FaUsers />,
    isAdminOnly: true, // Only visible to admin users
  },
  {
    label: "Trash",
    link: "/trashed",
    icon: <FaTrashAlt />,
    permission: "can delete task",
  },
];

const Sidebar = () => {
  const [isBranchProgressModalOpen, setBranchProgressModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const { permissions } = usePermissions();

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  // Filter links based on user permissions and admin status
  const filteredLinks = linkData.filter(
    (link) =>
      (!link.permission || permissions.includes(link.permission)) && // Permission check
      (!link.isAdminOnly || user?.isAdmin) // Admin-only check
  );

  const sidebarLinks = user?.isAdmin ? filteredLinks : filteredLinks.slice(0, 15);

  const NavLink = ({ el }) => {
    const handleClick = () => {
      if (el.label === "Branch Progress") {
        setBranchProgressModalOpen(true);
      } else {
        closeSidebar();
      }
    };

    return (
      <Link
        onClick={handleClick}
        to={el.label !== "Branch Progress" ? el.link : "#"}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 dark:text-gray-400 text-base hover:bg-[#10ed60]",
          path === el.link.split("/")[1] ? "bg-green-500 text-white" : ""
        )}
      >
        {el.icon}
        <span className="hover:text-[#2564ed]">{el.label}</span>
      </Link>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-5">
      <h1 className="flex gap-1 items-center">
        <p className="bg-white-600 p-2">
          <img src={logo} alt="TaskMe Logo" className="w-20 h-18" />
        </p>
        <span className="text-2xl font-bold text-black dark:text-white"></span>
      </h1>

      <div className="flex-1 flex flex-col gap-y-5 py-8">
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      {permissions.includes("can view team list") && (
        <div className="">
          <Link
            onClick={closeSidebar}
            to="/organization"
            className={clsx(
              "w-full flex gap-2 p-2 items-center text-lg text-gray-800 dark:text-white",
              path === "organization" ? "bg-green-500 text-white rounded-full" : ""
            )}
          >
            <MdSettings />
            <span>Organization</span>
          </Link>
        </div>
      )}

      {/* BranchProgressModal */}
      <BranchProgressModal open={isBranchProgressModalOpen} setOpen={setBranchProgressModalOpen} />
    </div>
  );
};

export default Sidebar;
