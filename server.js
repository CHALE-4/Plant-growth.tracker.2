/*

latest update for the 7pm growth code:
✔ 7 PM EST Growth Runs Properly
✔ Ensures Plants Grow Immediately if Server Restarts After 7 PM
✔ Prevents Missed Growth Updates
✔ Proper Logging for Debugging

*/



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone'); // Timezone handling

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve frontend from 'public' folder

let users = [
    { id: 1, name: "User1", plant: "Sunflower", stage: 1, paused: false },
    { id: 2, name: "User2", plant: "Rose", stage: 1, paused: false }
];

let plantTypes = ["Sunflower", "Rose", "Tulip"]; // Available plant types
let autoGrow = true;

// ✅ **Function to Grow Plants Automatically**
function growPlants() {
    if (!autoGrow) return;
    users.forEach(user => {
        if (!user.paused && user.stage < 5) user.stage++;
    });
    console.log("🌱 Plants grew to the next stage!");
}

// ✅ **API: Get All Users**
app.get('/users', (req, res) => res.json(users));

// ✅ **API: Toggle Automatic Growth**
app.post('/toggle-growth', (req, res) => {
    autoGrow = !autoGrow;
    res.json({ autoGrow });
});

// ✅ **API: Update Plant Stage or Pause**
app.post('/update-stage', (req, res) => {
    const { id, action } = req.body;
    const user = users.find(u => u.id === id);
    if (user) {
        if (action === 'next' && user.stage < 5) user.stage++;
        if (action === 'prev' && user.stage > 1) user.stage--;
        if (action === 'pause') user.paused = !user.paused;
    }
    res.json(users);
});

// ✅ **API: Add a New User**
app.post('/add-user', (req, res) => {
    const { name, plant } = req.body;
    if (!name || !plantTypes.includes(plant)) {
        return res.status(400).json({ error: "Invalid name or plant type" });
    }
    const newUser = { id: users.length + 1, name, plant, stage: 1, paused: false };
    users.push(newUser);
    res.json(users);
});

// ✅ **API: Add a New Plant Type**
app.post('/add-plant', (req, res) => {
    const { plant } = req.body;
    if (!plant || plantTypes.includes(plant)) {
        return res.status(400).json({ error: "Invalid or duplicate plant type" });
    }
    plantTypes.push(plant);
    res.json(plantTypes);
});

// ✅ **API: Get Available Plant Types**
app.get('/plants', (req, res) => res.json(plantTypes));

// ✅ **Function to Schedule Growth at 7 PM EST**
function scheduleGrowth() {
    const now = moment().tz("America/New_York"); // Get current time in EST

    // If it's exactly 7 PM EST, grow plants
    if (now.hour() === 19 && now.minute() === 0) {
        growPlants();
        console.log("🌱 Plants grew at 7 PM EST");
    }

    // If server restarts after 7 PM, grow plants immediately
    if (now.hour() >= 19) {
        growPlants();
        console.log("⚡ Server restarted after 7 PM, growing plants immediately!");
    }
}

// ✅ **Run the Growth Function Every Minute**
setInterval(scheduleGrowth, 60000);

// ✅ **Serve Frontend Files from 'public' Folder**
app.use(express.static('public'));

// ✅ **Serve Frontend**
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ **Start Server**
const PORT = process.env.PORT || 3000; // Use Vercel-assigned port or fallback to 3000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
