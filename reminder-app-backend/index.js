require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

const Reminder = new mongoose.model("reminder", reminderSchema);

setInterval(async () => {
    try {
        const reminderList = await Reminder.find({});
        if (reminderList) {
            reminderList.forEach(async (reminder) => {
                if (!reminder.isReminded) {
                    const now = new Date();
                    if ((new Date(reminder.remindAt) - now) < 0) {
                        await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });

                        // Check if it's a daily reminder
                        if (reminder.isEveryDay) {
                            // If it's a daily reminder, add 24 hours to the reminder time
                            const nextReminderTime = new Date(reminder.remindAt.getTime() + 24 * 60 * 60 * 1000);
                            reminder.remindAt = nextReminderTime;
                            await Reminder.findByIdAndUpdate(reminder._id, { remindAt: nextReminderTime });
                        }

                        const accountSid = process.env.ACCOUNT_SID;
                        const authToken = process.env.AUTH_TOKEN;
                        const client = require('twilio')(accountSid, authToken);
       
                        client.messages
                            .create({
                                body: reminder.reminderMsg,
                                from: 'whatsapp:+14155238886',
                                to: 'whatsapp:+919342707440'
                            })
                            .then(message => console.log(message.sid))
                            .catch(error => console.error('Error sending message:', error));
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}, 1000);

app.get("/getAllReminder", async (req, res) => {
    try {
        const reminderList = await Reminder.find({});
        res.send(reminderList);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addReminder", async (req, res) => {
    const { reminderMsg, remindAt, isEveryDay } = req.body; // Include isEveryDay in the request body
    try {
        const reminder = new Reminder({
            reminderMsg,
            remindAt,
            isEveryDay, // Save the isEveryDay flag in the database
            isReminded: false
        });

        await reminder.save();
        const updatedReminderList = await Reminder.find({});
        res.send(updatedReminderList);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/deleteReminder", async (req, res) => {
    const id = req.body.id;

    try {
        await Reminder.deleteOne({ _id: id });
        const updatedReminderList = await Reminder.find({});
        res.send(updatedReminderList);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));