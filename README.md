# VillageCare

<div align="center">
  <img src="/vite.svg" alt="VillageCare Logo" width="100" height="100">
  <h1>VillageCare - Bridging Generations Through Care</h1>
  <p>A platform connecting elders and volunteers, fostering a community where compassion meets companionship.</p>
</div>

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- PostgreSQL (v12.0 or later)

### Installation

1. Clone the repository
   ```bash
   git clone [https://github.com/yourusername/villagecare.git](https://github.com/nabilelmaa/villagecare.git)
   cd villagecare
   ```

2. Install dependencies

   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Return to root directory
   cd ..
   
   # Install backend dependencies
   cd server
   npm install
   ```

### Running the Application

1. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

2. Start the backend:
   ```bash
   cd ..
   cd server
   npm start
   ```

3. Open your browser and navigate to `http://localhost:5173` to view the application

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI

### Backend
- Node.js
- Express

### Database
- PostgreSQL

## Features

- **Role-based user system**: Users can switch between elder and volunteer modes
- **Request management**: Elders can create care requests, volunteers can accept them
- **Messaging system**: Secure communication between users
- **Profile management**: Customizable user profiles with verification
- **Dashboard**: Personalized dashboards for elders and volunteers
- **Responsive design**: Works seamlessly on both desktop and mobile devices
