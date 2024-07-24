const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors());

let serverRooms = [
  { id: 1, occupied: false, currentUser: null, endTime: null },
  { id: 2, occupied: false, currentUser: null, endTime: null },
  { id: 3, occupied: false, currentUser: null, endTime: null }
];

app.post('/reserve', (req, res) => {
  const { userId, duration } = req.body; // duration in minutes
  const reservationId = uuidv4();
  const now = new Date();
  const endTime = new Date(now.getTime() + duration * 60000);

  let roomAssigned = false;

  for (let room of serverRooms) {
    if (!room.occupied || room.endTime <= now) {
      room.occupied = true;
      room.currentUser = userId;
      room.endTime = endTime;
      roomAssigned = true;
      res.status(200).json({ reservationId, room: room.id, endTime });
      return;
    } else if (room.currentUser === userId) {
      res.status(200).json({ message: `User ${userId} is already in room ${room.id}`, endTime: room.endTime });
      return;
    }
  }

  if (!roomAssigned) {
    res.status(400).json({ message: 'All rooms are currently occupied. Please try again later.' });
  }
});

app.post('/status/:userId', (req, res) => {
  const userId = req.params.userId;
  let roomFound = false;

  for (let room of serverRooms) {
    if (room.currentUser === userId) {
      res.status(200).json({ message: `User ${userId} is in room ${room.id}`, endTime: room.endTime });
      roomFound = true;
      break;
    }
  }

  if (!roomFound) {
    res.status(404).json({ message: `User ${userId} is not in any room.` });
  }
});

app.post('/leave', (req, res) => {
  const { userId } = req.body;
  let roomFound = false;

  for (let room of serverRooms) {
    if (room.currentUser === userId) {
      room.occupied = false;
      room.currentUser = null;
      room.endTime = null;
      roomFound = true;
      res.status(200).json({ message: `User ${userId} has left room ${room.id}` });
      break;
    }
  }

  if (!roomFound) {
    res.status(400).json({ message: `User ${userId} is not in any room.` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
