#!/bin/bash

# Build React frontend
cd client || exit 1
npm install
npm run build

# Go back to root and install server dependencies
cd ..
cd server || exit 1
npm install
