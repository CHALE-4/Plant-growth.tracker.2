const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// MongoDB setup
const connectionString = 'mongodb+srv://stunjuapp:<db_password>@cluster0.o1rdk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB Atlas connection string
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('Error connecting to MongoDB Atlas:', err));

// Define MongoDB models
const userSchema = new mongoose.Schema({
    name: String,
    plant: String,
    stage: { type: Number, default: 1 },
    paused: { type: Boolean, default: false }
});
const plantTypeSchema = new mongoose.Schema({
    name: String
});

const User = mongoose.model('User', userSchema);
const PlantType = mongoose.model('PlantType', plantTypeSchema);

// Express setup
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve frontend from 'public' folder

let autoGrow = true;

// Function to grow plants automatically
async function growPlants() {
    if (!autoGrow) return;
    const users = await User.find({ paused: false, stage: { $lt: 5 } });
    users.forEach(async (user) => {
        user.stage++;
        await user.save();
    });
    console.log("Plants grew to the next stage");
}

// API to get all users
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// API to toggle automatic growth
app.post('/toggle-growth', (req, res) => {
    autoGrow = !autoGrow;
    res.json({ autoGrow });
});

// API to update a user's plant stage or pause
app.post('/update-stage', async (req, res) => {
    const { id, action } = req.body;
    const user = await User.findById(id);
    if (user) {
        if (action === 'next' && user.stage < 5) user.stage++;
        if (action === 'prev' && user.stage > 1) user.stage--;
        if (action === 'pause') user.paused = !user.paused;
        await user.save();
    }
    const users = await User.find();
    res.json(users);
});

// New API: Add a New User
app.post('/add-user', async (req, res) => {
    const { name, plant } = req.body;
    const plantExists = await PlantType.findOne({ name: plant });
    if (!name || !plantExists) {
        return res.status(400).json({ error: "Invalid name or plant type" });
    }
    const newUser = new User({ name, plant });
    await newUser.save();
    const users = await User.find();
    res.json(users);
});

// New API: Add a New Plant Type
app.post('/add-plant', async (req, res) => {
    const { plant } = req.body;
    const existingPlant = await PlantType.findOne({ name: plant });
    if (!plant || existingPlant) {
        return res.status(400).json({ error: "Invalid or duplicate plant type" });
    }
    const newPlant = new PlantType({ name: plant });
    await newPlant.save();
    const plantTypes = await PlantType.find();
    res.json(plantTypes);
});

// API: Get Available Plant Types
app.get('/plants', async (req, res) => {
    const plantTypes = await PlantType.find();
    res.json(plantTypes);
});

// Schedule automatic growth at 7 PM EST
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 19 && now.getMinutes() === 0) growPlants();
}, 60000);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

