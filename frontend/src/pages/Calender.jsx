import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import dayjs from "dayjs";

const localizer = dayjsLocalizer(dayjs);

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: null, end: null });
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/calender/");
      const data = await response.json();
      setEvents(data.map(event => ({
        title: event.title,
        start: new Date(event.date),
        end: new Date(event.date),
      })));
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
  };

  const handleEventSubmit = async () => {
    if (!newEvent.title || !selectedDate) return;

    const eventData = {
      title: newEvent.title,
      date: dayjs(selectedDate).format("YYYY-MM-DD"),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/calender/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setNewEvent({ title: "", start: null, end: null });
        fetchEvents();
        setOpen(false);
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "80vw", height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f4f4f4", margin: "auto" }}>
        <Paper elevation={6} sx={{ width: "70vw", height: "75vh", padding: 3, backgroundColor: "#fff", boxShadow: "0px 4px 16px rgba(0,0,0,0.1)", borderRadius: "16px" }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
            일정 관리
          </Typography>

          <Calendar
            localizer={localizer}
            events={events}
            selectable
            startAccessor="start"
            endAccessor="end"
            style={{ height: "60vh", width: "100%" }}
            onSelectSlot={handleSelectSlot}
            dayPropGetter={(date) => {
              const isSelected = selectedDate && dayjs(date).isSame(selectedDate, 'day');
              return {
                style: {
                  backgroundColor: isSelected ? "#1976d2" : "inherit",
                  color: isSelected ? "white" : "inherit",
                  fontWeight: isSelected ? "bold" : "normal",
                  borderRadius: isSelected ? "8px" : "0px",
                  transition: "background-color 0.3s",
                }
              };
            }}
          />
        </Paper>

        <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpen(true)}>
          일정 추가
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>일정 추가</DialogTitle>
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
            <Button onClick={() => setOpen(false)}>취소</Button>
            <Button variant="contained" onClick={handleEventSubmit}>
              추가
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EventCalendar;
