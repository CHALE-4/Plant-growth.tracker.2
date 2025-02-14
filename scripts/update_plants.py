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
        plant_path = os.path.join(image_folder, plant)

        # Find the current stage
        for i, stage in enumerate(stages):
            stage_path = os.path.join(image_folder, stage)
            if os.path.exists(stage_path):
                if i < len(stages) - 1:
                    next_stage_path = os.path.join(image_folder, stages[i + 1])
                    shutil.move(next_stage_path, plant_path)  # Move next stage to plant
                    print(f"Updated {plant} to {stages[i + 1]}")
                else:
                    print(f"{plant} is at the final stage.")
                break  # Stop after finding the current stage

if __name__ == "__main__":
    update_plant_growth()
