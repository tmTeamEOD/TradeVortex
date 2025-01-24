import React, { useState } from "react";
import { motion } from "framer-motion";

const Sidebar = ({ isDarkMode }) => {
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

  return (
      <aside
          className={`sticky top-[calc(var(--nav-height, 60px))] left-0 w-16 lg:w-56 h-[calc(100vh - 60px)] z-10 ${
              isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"
          } shadow-md transition-all duration-300 overflow-y-auto`}
      >
        <div className="flex flex-col items-center lg:items-start p-4 space-y-4">
          {/* 로고 */}
          <div className="w-full flex items-center justify-center lg:justify-start">
      <span
          className={`text-xl font-semibold ${
              isDarkMode ? "text-indigo-400" : "text-indigo-600"
          }`}
      >
        지미졸리네
      </span>
          </div>

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
                    <i className={`${item.icon} text-lg`}></i>
                    <span className="hidden lg:inline-block text-sm font-medium ml-3">
              {item.label}
            </span>
                  </div>

                  {/* 소메뉴 */}
                  {expandedMenu === index && (
                      <motion.ul
                          initial={{opacity: 0, height: 0}}
                          animate={{opacity: 1, height: "auto"}}
                          exit={{opacity: 0, height: 0}}
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
