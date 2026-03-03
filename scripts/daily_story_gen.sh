#!/bin/bash

# Configuration
PROJECT_DIR="/Users/nayuta/.gemini/Nayuta_Brain/01_Projects/nyctstudio-web"
NODE_PATH="/usr/local/bin/node"

# Navigate to project directory
cd "$PROJECT_DIR"

# Run the script
"$NODE_PATH" scripts/generate_insta_story.js >> "$PROJECT_DIR/scripts/daily_log.txt" 2>&1
