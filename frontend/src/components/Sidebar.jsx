import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux"; // Redux hook import
import { toggleDarkMode } from "../redux/slices/themeSlice"; // 액션 임포트

const Sidebar = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode); // Redux에서 다크모드 상태 가져오기

  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { icon: "fas fa-home", label: "홈", submenu: ["대시보드", "최근 활동", "설정"] },
    { icon: "fas fa-chart-line", label: "차트", submenu: ["실시간 차트", "히스토리", "트렌드"] },
    { icon: "fas fa-newspaper", label: "뉴스", submenu: ["오늘의 뉴스", "시장 동향", "주요 이벤트"] },
    { icon: "fas fa-comments", label: "토론", submenu: ["인기 게시글", "내 참여 토론", "새로운 토론"] },
    { icon: "fas fa-cogs", label: "설정", submenu: ["계정 관리", "알림 설정", "테마 변경"] },
  ];

  const toggleMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  // 다크모드 토글 함수
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode()); // Redux 액션 호출하여 다크모드 상태 변경
  };

  return (
    <aside
      className={`z-20 w-full h-screen left-0 lg:w-56 ${
        isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"
      } shadow-md transition-all duration-300 overflow-y-auto`}
    >
      <div className="flex-col items-center lg:items-start p-4 space-y-4">
        {/* 메뉴 항목들 */}
        <ul className="w-full space-y-3">
          {menuItems.map((item, index) => (
            <li key={index} className="w-full">
              <div
                className={`flex items-center w-full px-4 py-2 rounded-md cursor-pointer ${
                  isDarkMode
                    ? "hover:bg-indigo-600 hover:text-white"
                    : "hover:bg-indigo-100 hover:text-indigo-600"
                }`}
                onClick={() => toggleMenu(index)}
              >
                <i className={`${item.icon} text-xl lg:text-2xl`}></i>
                <span className="ml-3 text-sm lg:text-base text-ellipsis overflow-hidden whitespace-nowrap lg:inline-block">
                  {item.label}
                </span>
              </div>

              {/* 소메뉴 */}
              {expandedMenu === index && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-6 mt-2 space-y-2"
                >
                  {item.submenu.map((submenuItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`text-sm font-light px-4 py-1 rounded-md cursor-pointer ${
                        isDarkMode
                          ? "hover:bg-indigo-700 hover:text-white"
                          : "hover:bg-indigo-200 hover:text-indigo-800"
                      }`}
                    >
                      {submenuItem}
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
