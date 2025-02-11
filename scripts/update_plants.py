import os
import shutil

# Define the image folder
image_folder = "images"

# Define plant growth stages
plant_stages = {
    "plant1.png": ["plant1_stage1.png", "plant1_stage2.png", "plant1_stage3.png"],
    "plant2.png": ["plant2_stage1.png", "plant2_stage2.png", "plant2_stage3.png"]
}

# Function to update plant stages
def update_plant_growth():
    for plant, stages in plant_stages.items():
        current_stage = next((s for s in stages if os.path.exists(os.path.join(image_folder, s))), None)
        if current_stage:
            current_index = stages.index(current_stage)
            if current_index < len(stages) - 1:
                next_stage = stages[current_index + 1]
                shutil.move(os.path.join(image_folder, next_stage), os.path.join(image_folder, plant))
                print(f"Updated {plant} to {next_stage}")

if __name__ == "__main__":
    update_plant_growth()

