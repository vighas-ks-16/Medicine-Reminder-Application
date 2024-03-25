import './App.css';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [reminderMsg, setReminderMsg] = useState("");
  const [remindAt, setRemindAt] = useState(() => {
    const now = new Date();
    now.setSeconds(0);
    return now;
  });
  const [isEveryDay, setIsEveryDay] = useState(false); // New state for daily reminders
  const [reminderList, setReminderList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/getAllReminder")
      .then(res => setReminderList(res.data))
      .catch(error => console.error('Error fetching reminders:', error));
  }, []);

  useEffect(() => {
    const now = new Date();
    now.setSeconds(0);
    setRemindAt(now);
  }, []);

  const addReminder = () => {
    if (reminderMsg.trim() === "") {
      setError("Reminder message cannot be empty.");
      return;
    }

    setError(null);

    const reminderData = {
      reminderMsg,
      remindAt,
      isEveryDay, // Include the "isEveryDay" flag in the data sent to the server
    };

    axios.post("http://localhost:5000/addReminder", reminderData)
      .then(res => {
        setReminderList(res.data);
        setReminderMsg("");
        const now = new Date();
        now.setSeconds(0);
        setRemindAt(now);
        setIsEveryDay(false); // Reset the daily reminder flag
        window.location.reload(); // Reload the page
      })
      .catch(error => console.error('Error adding reminder:', error));
  }

  const deleteReminder = (id) => {
    axios.post("http://localhost:5000/deleteReminder", { id })
      .then(res => setReminderList(res.data))
      .catch(error => console.error('Error deleting reminder:', error));
  }

  return (
    <div className="App">
      <div className="homepage">
        <div className="homepage_header">
          <h1>Remind Me</h1>
          <input
            type="text"
            placeholder="Reminder notes here..."
            value={reminderMsg}
            onChange={e => setReminderMsg(e.target.value)}
          />

          <div>
            <label>Date:</label>
            <input
              type="date"
              value={remindAt.toISOString().split('T')[0]}
              onChange={e => setRemindAt(new Date(e.target.value))}
            />
          </div>

          <div>
            <label>Time:</label>
            <div style={{ display: "flex" }}>
              <select
                value={parseInt(remindAt.toTimeString().slice(0, 2), 10) % 12 || 12}
                onChange={e => {
                  const hours = parseInt(e.target.value, 10) + (remindAt.getHours() >= 12 ? 12 : 0);
                  setRemindAt(new Date(remindAt.setHours(hours, 0)));
                }}
              >
                {[...Array(12).keys()].map(hour => (
                  <option key={hour} value={hour + 1}>
                    {hour + 1}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                value={remindAt.getMinutes()}
                onChange={e => {
                  setRemindAt(new Date(remindAt.setMinutes(parseInt(e.target.value, 10))));
                }}
              >
                {[...Array(60).keys()].map(minute => (
                  <option key={minute} value={minute}>
                    {minute < 10 ? `0${minute}` : minute}
                  </option>
                ))}
              </select>
              <select
                value={remindAt.getHours() >= 12 ? "PM" : "AM"}
                onChange={e => {
                  const hours = remindAt.getHours() % 12 + (e.target.value === "PM" ? 12 : 0);
                  setRemindAt(new Date(remindAt.setHours(hours)));
                }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={isEveryDay}
                onChange={() => setIsEveryDay(!isEveryDay)}
              />
              Remind Me Every Day
            </label>
          </div>

          <div className="button" onClick={addReminder}>Add Reminder</div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="homepage_body">
          {reminderList.map(reminder => (
            <div className="reminder_card" key={uuidv4()}>
              <h2>{reminder.reminderMsg}</h2>
              <h3>Remind Me at:</h3>
              <p>{reminder.remindAt ? new Date(reminder.remindAt).toLocaleString(undefined, { timezone: "Asia/Kolkata", hour12: true }) : 'No date available'}</p>
              {reminder.isEveryDay && (
                <p>Daily Reminder</p>
              )}
              <div className="button" onClick={() => deleteReminder(reminder._id)}>Delete</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;