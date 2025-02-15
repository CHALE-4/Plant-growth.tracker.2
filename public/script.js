// Fetch and display users in the table
function fetchUsers() {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const table = document.getElementById('plants-table');
            table.innerHTML = ''; // Clear old data
            users.forEach(user => {
                table.innerHTML += `
                    <tr>
                        <td><img src="plants/${user.plant}_${user.stage}.png" width="50"></td>
                        <td>${user.name}</td>
                        <td><a href="#">Profile</a></td>
                        <td>
                            <button onclick="updateStage(${user.id}, 'prev')">◀</button>
                            <button onclick="updateStage(${user.id}, 'next')">▶</button>
                            <button onclick="updateStage(${user.id}, 'pause')">${user.paused ? 'Resume' : 'Pause'}</button>
                        </td>
                    </tr>
                `;
            });
        });
}

// Update a plant's stage or pause growth
function updateStage(id, action) {
    fetch('/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
    }).then(fetchUsers);
}

// Toggle automatic growth
function toggleGrowth() {
    fetch('/toggle-growth', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert(`Automatic Growth: ${data.autoGrow ? "Enabled" : "Disabled"}`);
        });
}

// Add a new user manually
function addUser() {
    const name = prompt("Enter username:");
    fetch('/plants') // Fetch available plant types
        .then(response => response.json())
        .then(plants => {
            const plant = prompt(`Choose a plant: ${plants.join(", ")}`);
            if (!plants.includes(plant)) {
                alert("Invalid plant type");
                return;
            }
            fetch('/add-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, plant })
            }).then(fetchUsers);
        });
}

// Add a new plant type manually
function addPlant() {
    const plant = prompt("Enter new plant type:");
    fetch('/add-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant })
    }).then(response => response.json())
      .then(plants => alert(`Available plants: ${plants.join(", ")}`));
}

// Load users on page load
fetchUsers();
