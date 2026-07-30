#!/bin/bash

# ============================================
# Electro-Pi Task Manager - Docker Startup Script
# ============================================

echo ""
echo "============================================"
echo " Electro-Pi Task Manager - Docker Setup"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed!"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "[✓] Docker is installed"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose is not installed!"
    exit 1
fi

echo "[✓] Docker Compose is available"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "[!] .env file not found!"
    echo ""
    echo "Creating .env from .env.docker.example..."
    
    if [ -f ".env.docker.example" ]; then
        cp .env.docker.example .env
        echo "[✓] .env file created"
        echo ""
        echo "[!] IMPORTANT: Please edit .env file and update:"
        echo "    - JWT_SECRET (minimum 32 characters)"
        echo "    - JWT_REFRESH_SECRET (minimum 32 characters)"
        echo "    - Other configuration as needed"
        echo ""
        read -p "Press Enter to continue..."
    else
        echo "[ERROR] .env.docker.example file not found!"
        exit 1
    fi
fi

echo "[✓] .env file exists"
echo ""

echo "============================================"
echo " Starting Docker Containers"
echo "============================================"
echo ""
echo "This will start:"
echo " - MongoDB Database"
echo " - Backend API (Node.js + Express)"
echo " - Frontend Application (Next.js)"
echo ""
echo "Please wait, this may take a few minutes..."
echo ""

# Start Docker Compose
docker-compose up --build

echo ""
echo "============================================"
echo " Docker containers stopped"
echo "============================================"
echo ""
