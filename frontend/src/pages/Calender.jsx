import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../redux/slices/themeSlice";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Switch,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import dayjs from "dayjs";

const localizer = dayjsLocalizer(dayjs);
const API_URL = "http://192.168.0.6:8000/api/calender/";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: null });
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      background: {
        default: isDarkMode ? "#121212" : "#f4f4f4",
        paper: isDarkMode ? "#333" : "#fff",
      },
      text: {
        primary: isDarkMode ? "#ffffff" : "#000000",
      },
    },
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(API_URL);
      setEvents(
        response.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.date),
          end: new Date(event.date),
        }))
      );
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            width: "90vw",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            margin: "auto",
            padding: 2,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: "80vw",
              height: "75vh",
              padding: 3,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: "16px",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">📅 금융 일정</Typography>
            </Box>
            <Calendar
              localizer={localizer}
              events={events}
              selectable
              startAccessor="start"
              endAccessor="end"
              style={{ height: "60vh", width: "100%" }}
              onSelectSlot={({ start }) => setSelectedDate(start)}
              onSelectEvent={(event) => {
                setSelectedEvent(event);
                setOpenEventModal(true);
              }}
              dayPropGetter={(date) => {
                const isSelected = selectedDate && dayjs(date).isSame(selectedDate, "day");
                return {
                  style: {
                    backgroundColor: isSelected ? (isDarkMode ? "#1976d2" : "#90caf9") : "inherit",
                    color: isSelected ? "white" : "inherit",
                    fontWeight: isSelected ? "bold" : "normal",
                    borderRadius: isSelected ? "8px" : "0px",
                    transition: "background-color 0.3s",
                  },
                };
              }}
            />
          </Paper>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default EventCalendar;
