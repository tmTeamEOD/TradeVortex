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
      { label: "대시 보드", path: "/dashboard" },
      { label: "설정", path: "/settings" },
    ] },
    { icon: "fas fa-chart-line", label: "차트", path: "/charts", submenu: [
      { label: "실시간 차트", path: "/charts" },
      { label: "히스토리", path: "/charts/history" },
      { label: "트렌드", path: "/charts/trend" },
    ] },
    { icon: "fas fa-newspaper", label: "뉴스", path: "/news", submenu: [
      { label: "오늘의 뉴스", path: "/news/today" },
      { label: "전체 뉴스", path: "/newsboard" },
      { label: "주요 이벤트", path: "/news/events" },
    ] },
    { icon: "fas fa-comments", label: "토론", path: "/discussions", submenu: [
      { label: "진행중인 토론", path: "/discussion" },
    ] },
    { icon: "fas fa-cogs", label: "설정", path: "/settings", submenu: [
      { label: "계정 관리", path: "/settings/account" },
      { label: "알림 설정", path: "/settings/notifications" },
      { label: "테마 변경", path: "/settings/theme" },
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
