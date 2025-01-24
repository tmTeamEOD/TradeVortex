// components/DigitalClock.jsx
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import {AnimatePresence, motion} from "framer-motion";
import {Link} from "react-router-dom"; // moment-timezone 임포트

const DigitalClock = ({ isDarkMode, timezone }) => { // timezone prop 받기
  const [time, setTime] = useState(moment().tz(timezone)); // 시간 설정 변경

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(moment().tz(timezone)); // 시간 업데이트 변경
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timezone]); // timezone이 변경될 때마다 useEffect 다시 실행

  const formattedTime = time.format('HH:mm:ss'); // moment를 사용하여 포맷팅

  return (
    <div className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {formattedTime}
    </div>
  );
};

export default DigitalClock;


