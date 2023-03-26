# My Rhythm Player

# <a href="https://my-rhythm-player.web.app/">Live Preview</a>

My Rhythm Player is a web-based drum machine and metronome application built using the MERN (MongoDB, Express, React, Node) stack. The drum machine features a simple interface inspired by Garage Band, that allows users to create and save custom drum patterns with up to 4 instruments using audio samples. The metronome includes the ability to customize the sound with both samples and oscillators and offers a practice mode to repeat sections at an optional increased speed for each repeat to provide the user with the best possible practice experience.

## Technologies Used

### Frontend

- React
- React Router
- Web Audio API (using samples and oscillators)

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose

### Authentication

- Firebase Authentication

## Features

- Create, save, edit, and delete custom drum patterns and metronomes
- Metronome with adjustable tempo, subdivisions, time signatures, and practice mode
- User authentication using Firebase

## Installation

1. Clone this repository to your local machine.
2. Navigate to the `/client` directory and create a `.env` file based on the `.env.example` file provided.
3. Navigate to the `/server` directory and create a `.env` file based on the `.env.example` file provided.
4. Run `npm install` in both the `/client` and `/server` directories.
5. Start the server by running `npm start` in the `/server` directory.
6. Start the client by running `npm start` in the `/client` directory.

Note: The application will be available at the port specified in the `/client/.env` file. MongoDB can be run locally or in the cloud, and a firebase account is required.
