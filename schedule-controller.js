const { Router } = require("express");
const { verifyToken } = require("./jwt");
const { lunchSchedules } = require("./lunch-schedules");

function scheduleController(db) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, db));
  router.get("/lunch", verifyToken, (req, res) => listLunch(req, res, db));
  return router;
}

async function list(req, res, db) {
  const userId = req.userId;
  db.query(
    `
   SELECT schedule.* FROM class
   JOIN schedule ON schedule.classId = class.id
   JOIN user ON class.id = user.classId
   WHERE user.id = ?
    `,
    [userId],
    (err, result) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
        return;
      }
      return res.json(transformSchedule(result));
    }
  );
}

function listLunch(req, res) {
  return res.json(lunchSchedules);
}

function transformSchedule(schedules) {
  const transformedSchedules = schedules.reduce((result, schedule) => {
    const existingEntry = result.find((entry) => entry.day === schedule.day);
    if (existingEntry) {
      existingEntry.times.push({
        time: schedule.time,
        subject: schedule.subject,
      });
    } else {
      result.push({
        id: schedule.id,
        classId: schedule.classId,
        day: schedule.day,
        times: [
          {
            time: schedule.time,
            subject: schedule.subject,
          },
        ],
      });
    }

    return result;
  }, []);
  return transformedSchedules;
}

module.exports = scheduleController;
