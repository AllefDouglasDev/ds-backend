const express = require("express");
const cors = require("cors");
const authController = require("./auth-controller");
const { PrismaClient } = require("@prisma/client");
const eventController = require("./event-controller");
const scheduleController = require("./schedule-controller");
const taskController = require("./task-controller");

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/auth", authController(prisma));
app.use("/events", eventController(prisma));
app.use("/schedules", scheduleController(prisma));
app.use("/tasks", taskController(prisma));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});