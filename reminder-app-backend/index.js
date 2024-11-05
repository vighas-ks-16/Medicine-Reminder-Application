require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

<<<<<<< HEAD
// Connect to MongoDB with an increased timeout to handle delays
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // Set timeout to 30 seconds
=======
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
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

<<<<<<< HEAD
const Reminder = mongoose.model("reminder", reminderSchema);

// Check reminders periodically and send WhatsApp messages for due reminders
=======
const Reminder = new mongoose.model("reminder", reminderSchema);

>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
setInterval(async () => {
    try {
        const reminderList = await Reminder.find({});
        if (reminderList) {
            reminderList.forEach(async (reminder) => {
                if (!reminder.isReminded) {
                    const now = new Date();
                    if ((new Date(reminder.remindAt) - now) < 0) {
                        await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });

<<<<<<< HEAD
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

=======
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
       
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
                        client.messages
                            .create({
                                body: reminder.reminderMsg,
                                from: 'whatsapp:+14155238886',
                                to: 'whatsapp:+919342707440'
                            })
<<<<<<< HEAD
                            .then(message => console.log("Message sent with SID:", message.sid))
=======
                            .then(message => console.log(message.sid))
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
                            .catch(error => console.error('Error sending message:', error));
                    }
                }
            });
        }
    } catch (err) {
<<<<<<< HEAD
        console.error("Error in reminder checking interval:", err);
    }
}, 1000); // Runs every second

// Endpoint to get all reminders
=======
        console.error(err);
    }
}, 1000);

>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
app.get("/getAllReminder", async (req, res) => {
    try {
        const reminderList = await Reminder.find({});
        res.send(reminderList);
    } catch (err) {
<<<<<<< HEAD
        console.error("Error fetching reminders:", err);
=======
        console.error(err);
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
        res.status(500).send("Internal Server Error");
    }
});

<<<<<<< HEAD
// Endpoint to add a new reminder
app.post("/addReminder", async (req, res) => {
    const { reminderMsg, remindAt, isEveryDay } = req.body;
=======
app.post("/addReminder", async (req, res) => {
    const { reminderMsg, remindAt, isEveryDay } = req.body; // Include isEveryDay in the request body
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
    try {
        const reminder = new Reminder({
            reminderMsg,
            remindAt,
<<<<<<< HEAD
            isEveryDay,
=======
            isEveryDay, // Save the isEveryDay flag in the database
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
            isReminded: false
        });

        await reminder.save();
        const updatedReminderList = await Reminder.find({});
        res.send(updatedReminderList);
    } catch (err) {
<<<<<<< HEAD
        console.error("Error adding reminder:", err);
=======
        console.error(err);
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
        res.status(500).send("Internal Server Error");
    }
});

<<<<<<< HEAD
// Endpoint to delete a reminder
=======
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
app.post("/deleteReminder", async (req, res) => {
    const id = req.body.id;

    try {
        await Reminder.deleteOne({ _id: id });
        const updatedReminderList = await Reminder.find({});
        res.send(updatedReminderList);
    } catch (err) {
<<<<<<< HEAD
        console.error("Error deleting reminder:", err);
=======
        console.error(err);
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
=======
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
>>>>>>> 1c541f66e13170b98008636c808a217d732caf92
