import { createSlice } from "@reduxjs/toolkit";

// 로컬 스토리지에서 초기 다크모드 상태 로드
const loadDarkModeFromLocalStorage = () => {
  try {
    const storedDarkMode = localStorage.getItem("isDarkMode");
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  } catch {
    return false; // 에러 발생 시 기본값 false 반환
  }
};

const initialState = {
  isDarkMode: loadDarkModeFromLocalStorage(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      const newMode = !state.isDarkMode;
      if (newMode !== state.isDarkMode) {
        state.isDarkMode = newMode;
        localStorage.setItem("isDarkMode", JSON.stringify(state.isDarkMode));
      }
    },
    setDarkMode(state, action) {
      const newMode = action.payload;
      if (newMode !== state.isDarkMode) {
        state.isDarkMode = newMode;
        localStorage.setItem("isDarkMode", JSON.stringify(state.isDarkMode));
      }
    },
  },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;