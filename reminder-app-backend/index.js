require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB with an increased timeout to handle delays
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // Set timeout to 30 seconds
}).then(() => {
    console.log("DB connected");
}).catch((error) => {
    console.error("Error connecting to database:", error);
});

const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: Date,
    isEveryDay: Boolean, // Include a flag for daily reminders
    isReminded: Boolean
});

const Reminder = mongoose.model("reminder", reminderSchema);

// Check reminders periodically and send WhatsApp messages for due reminders
setInterval(async () => {
    try {
        const reminderList = await Reminder.find({});
        if (reminderList) {
            reminderList.forEach(async (reminder) => {
                if (!reminder.isReminded) {
                    const now = new Date();
                    if ((new Date(reminder.remindAt) - now) < 0) {
                        await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });

                        // If it's a daily reminder, set the next reminder time for 24 hours later
                        if (reminder.isEveryDay) {
                            const nextReminderTime = new Date(reminder.remindAt.getTime() + 24 * 60 * 60 * 1000);
                            reminder.remindAt = nextReminderTime;
                            await Reminder.findByIdAndUpdate(reminder._id, { remindAt: nextReminderTime, isReminded: false });
                        }

                        // Send WhatsApp message using Twilio
                        const accountSid = process.env.ACCOUNT_SID;
                        const authToken = process.env.AUTH_TOKEN;
                        const client = require('twilio')(accountSid, authToken);

                        client.messages
                            .create({
                                body: reminder.reminderMsg,
                                from: 'whatsapp:+14155238886',
                                to: 'whatsapp:+919342707440'
                            })
                            .then(message => console.log("Message sent with SID:", message.sid))
                            .catch(error => console.error('Error sending message:', error));
                    }
                }
            });
        }
    } catch (err) {
        console.error("Error in reminder checking interval:", err);
    }
}, 1000); // Runs every second

// Endpoint to get all reminders
app.get("/getAllReminder", async (req, res) => {
    try {
        const reminderList = await Reminder.find({});
        res.send(reminderList);
    } catch (err) {
        console.error("Error fetching reminders:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint to add a new reminder
app.post("/addReminder", async (req, res) => {
    const { reminderMsg, remindAt, isEveryDay } = req.body;
    try {
        const reminder = new Reminder({
            reminderMsg,
            remindAt,
            isEveryDay,
            isReminded: false
        });

        await reminder.save();
        const updatedReminderList = await Reminder.find({});
        res.send(updatedReminderList);
    } catch (err) {
        console.error("Error adding reminder:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint to delete a reminder
app.post("/deleteReminder", async (req, res) => {
    const id = req.body.id;

    try {
        await Reminder.deleteOne({ _id: id });
        const updatedReminderList = await Reminder.find({});
        res.send(updatedReminderList);
    } catch (err) {
        console.error("Error deleting reminder:", err);
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
