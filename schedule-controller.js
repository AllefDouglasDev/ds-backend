const { Router } = require("express");
const { verifyToken } = require("./jwt");

function scheduleController(prisma) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, prisma));
  return router;
}

async function list(req, res, prisma) {
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { class: true },
  });
  if (!user) {
    console.error("User not found");
    return [];
  }
  if (!user.class) {
    console.error("User is not associated with any class");
    return [];
  }
  const schedules = await prisma.schedule.findMany({
    where: {
      classId: user.class.id,
    },
  });
  return res.json(transformSchedule(schedules));
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
