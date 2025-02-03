import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import dayjs from "dayjs";

const localizer = dayjsLocalizer(dayjs);
const API_URL = "http://127.0.0.1:8000/api/calender/";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: null });
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // 📌 데이터 불러오기 (GET 요청)
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(API_URL);
      setEvents(
        response.data.map(event => ({
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

  // 📌 일정 추가하기 (POST 요청)
  const handleEventSubmit = async () => {
    if (!newEvent.title || !selectedDate) return;

    const eventData = {
      title: newEvent.title,
      date: dayjs(selectedDate).format("YYYY-MM-DD"),
    };

    try {
      await axios.post(API_URL, eventData);
      setNewEvent({ title: "", start: null });
      fetchEvents();
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // 📌 일정 삭제하기 (DELETE 요청)
  const handleEventDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setEvents(events.filter(event => event.id !== id));
      setOpenEventModal(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "90vw", height: "85vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f4f4f4", margin: "auto", padding: 2 }}>
        <Paper elevation={6} sx={{ width: "80vw", height: "75vh", padding: 3, backgroundColor: "#fff", borderRadius: "16px" }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
            📅 금융 일정
          </Typography>

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
                  backgroundColor: isSelected ? "#1976d2" : "inherit",
                  color: isSelected ? "white" : "inherit",
                  fontWeight: isSelected ? "bold" : "normal",
                  borderRadius: isSelected ? "8px" : "0px",
                  transition: "background-color 0.3s",
                  cursor: isSelected ? "pointer" : "default",
                },
              };
            }}
          />
        </Paper>

        <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenAddModal(true)}>
          + 일정 추가
        </Button>

        {/* 📌 일정 추가 모달 */}
        <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
          <DialogTitle>📌 일정 추가</DialogTitle>
          <DialogContent>
            <TextField
              label="일정 제목"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddModal(false)}>취소</Button>
            <Button variant="contained" onClick={handleEventSubmit}>
              추가
            </Button>
          </DialogActions>
        </Dialog>

        {/* 📌 일정 상세 모달 */}
        <Dialog open={openEventModal} onClose={() => setOpenEventModal(false)}>
          <DialogTitle>📌 일정 상세</DialogTitle>
          <DialogContent>
            {selectedEvent ? (
              <>
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Typography color="textSecondary">
                  📅 {dayjs(selectedEvent.start).format("YYYY-MM-DD")}
                </Typography>
              </>
            ) : (
              <Typography>일정 정보를 불러오는 중...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <IconButton edge="end" onClick={() => handleEventDelete(selectedEvent.id)} color="error">
              <Delete />
            </IconButton>
            <Button onClick={() => setOpenEventModal(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EventCalendar;
