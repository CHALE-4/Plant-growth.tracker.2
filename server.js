const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve frontend from 'public' folder

let users = [
    { id: 1, name: "User1", plant: "Sunflower", stage: 1, paused: false },
    { id: 2, name: "User2", plant: "Rose", stage: 1, paused: false }
];

let plantTypes = ["Sunflower", "Rose", "Tulip"]; // List of available plants
let autoGrow = true;

// Function to grow plants automatically
function growPlants() {
    if (!autoGrow) return;
    users.forEach(user => {
        if (!user.paused && user.stage < 5) user.stage++;
    });
    console.log("Plants grew to the next stage");
}

// API to get all users
app.get('/users', (req, res) => res.json(users));

// API to toggle automatic growth
app.post('/toggle-growth', (req, res) => {
    autoGrow = !autoGrow;
    res.json({ autoGrow });
});

// API to update a user's plant stage or pause
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

// ✅ **New API: Add a New User**
app.post('/add-user', (req, res) => {
    const { name, plant } = req.body;
    if (!name || !plantTypes.includes(plant)) {
        return res.status(400).json({ error: "Invalid name or plant type" });
    }
    const newUser = { id: users.length + 1, name, plant, stage: 1, paused: false };
    users.push(newUser);
    res.json(users);
});

// ✅ **New API: Add a New Plant Type**
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

// Schedule automatic growth at 7 PM EST
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 19 && now.getMinutes() === 0) growPlants();
}, 60000);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
