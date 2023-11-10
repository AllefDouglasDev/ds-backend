const { Router } = require("express");
const { verifyToken } = require("./jwt");
const { lunchSchedules } = require("./lunch-schedules");

function scheduleController(prisma) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, prisma));
  router.get("/lunch", verifyToken, (req, res) => listLunch(req, res, prisma));
  return router;
}

async function list(req, res, prisma) {
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { class: true },
  });
  if (!user) {
    return [];
  }
  if (!user.class) {
    return [];
  }
  const schedules = await prisma.schedule.findMany({
    where: {
      classId: user.class.id,
    },
  });
  return res.json(transformSchedule(schedules));
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
