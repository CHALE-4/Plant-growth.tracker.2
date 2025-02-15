const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
const imagePath = path.join(__dirname, 'public', 'images');

// Function to grow plants automatically and update images
function growPlants() {
    if (!autoGrow) return;
    users.forEach(user => {
        if (!user.paused && user.stage < 5) {
            user.stage++;
            updatePlantImage(user);
        }
    });
    console.log("Plants grew to the next stage");
}

// Function to update plant images
function updatePlantImage(user) {
    const oldImage = path.join(imagePath, `${user.plant.toLowerCase()}_stage${user.stage - 1}.png`);
    const newImage = path.join(imagePath, `${user.plant.toLowerCase()}_stage${user.stage}.png`);
    
    if (fs.existsSync(newImage)) {
        fs.copyFileSync(newImage, oldImage);
        console.log(`Updated ${user.name}'s plant image to stage ${user.stage}`);
    }
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
        if (action === 'next' && user.stage < 5) {
            user.stage++;
            updatePlantImage(user);
        }
        if (action === 'prev' && user.stage > 1) {
            user.stage--;
            updatePlantImage(user);
        }
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

// Listen on dynamic port for Render
const port = process.env.PORT || 3000; // Default to 3000 for local dev
app.listen(port, () => console.log(`Server running on port ${port}`));
