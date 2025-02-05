import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../redux/slices/themeSlice";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { icon: "fas fa-home", label: "홈", path: "/", submenu: [
      { label: "메인", path: "/main" },
      { label: "첫화면", path: "/" },
    ] },
    { icon: "fas fa-chart-line", label: "차트", path: "/charts", submenu: [
      { label: "실시간 차트", path: "/charts" },
    ] },
    { icon: "fas fa-newspaper", label: "뉴스", path: "/news", submenu: [
      { label: "최신 뉴스", path: "/news" },
      { label: "전체 뉴스", path: "/newsboard" },
    ] },
    { icon: "fas fa-comments", label: "토론", path: "/discussions", submenu: [
      { label: "진행중인 토론", path: "/discussion" },
    ] },
  ];

  const toggleMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <aside className={`z-20 w-full h-screen left-0 lg:w-56 ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"} shadow-md transition-all duration-300 overflow-y-auto`}>
      <div className="flex-col items-center lg:items-start p-4 space-y-4">
        <ul className="w-full space-y-3">
          {menuItems.map((item, index) => (
            <li key={index} className="w-full">
              <div
                className={`flex items-center w-full px-4 py-2 rounded-md cursor-pointer ${isDarkMode ? "hover:bg-indigo-600 hover:text-white" : "hover:bg-indigo-100 hover:text-indigo-600"}`}
                onClick={() => toggleMenu(index)}
              >
                <i className={`${item.icon} text-xl lg:text-2xl`}></i>
                <span className="ml-3 text-sm lg:text-base text-ellipsis overflow-hidden whitespace-nowrap lg:inline-block">
                  {item.label}
                </span>
              </div>

              {expandedMenu === index && (
                <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-6 mt-2 space-y-2">
                  {item.submenu.map((submenuItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`text-sm font-light px-4 py-1 rounded-md cursor-pointer ${isDarkMode ? "hover:bg-indigo-700 hover:text-white" : "hover:bg-indigo-200 hover:text-indigo-800"}`}
                      onClick={() => handleNavigate(submenuItem.path)}
                    >
                      {submenuItem.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
