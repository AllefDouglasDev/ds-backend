const express = require("express");
const cors = require("cors");
const authController = require("./auth-controller");
const eventController = require("./event-controller");
const scheduleController = require("./schedule-controller");
const taskController = require("./task-controller");
const classController = require("./class-controller");
const usersController = require("./user-controller");
const mysql = require("mysql");

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

const dbConnection = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "digitalschedule",
});

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/auth", authController(dbConnection));
app.use("/events", eventController(dbConnection));
app.use("/schedules", scheduleController(dbConnection));
app.use("/tasks", taskController(dbConnection));
app.use("/classes", classController(dbConnection));
app.use("/users", usersController(dbConnection));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
