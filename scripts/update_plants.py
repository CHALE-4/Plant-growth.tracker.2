import json
import os
import shutil

# Load plant data
with open('data/plants.json', 'r') as file:
    plants = json.load(file)

# Update plant stages
for plant in plants:
    if plant["stage"] < 3:  # Max stage is 3
        plant["stage"] += 1
        new_image = f"images/{plant['image'].split('.')[0]}_stage{plant['stage']}.jpg"
        
        # Overwrite the current image
        shutil.copy(new_image, f"images/{plant['image']}")

# Save updated plant data
with open('data/plants.json', 'w') as file:
    json.dump(plants, file, indent=4)
