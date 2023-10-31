const { Router } = require("express");
const { verifyToken } = require("./jwt");

function taskController(prisma) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, prisma));
  router.get("/:id", verifyToken, (req, res) => findOne(req, res, prisma));
  router.post("/", verifyToken, (req, res) => create(req, res, prisma));
  router.post("/:id/delivery", verifyToken, (req, res) =>
    delivery(req, res, prisma)
  );
  router.post("/:id/doubt", verifyToken, (req, res) =>
    createDoubt(req, res, prisma)
  );
  router.put("/:id", verifyToken, (req, res) => update(req, res, prisma));
  router.delete("/:id", verifyToken, (req, res) => remove(req, res, prisma));
  return router;
}

async function list(req, res, prisma) {
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { class: true },
  });
  if (user.type === "teacher") {
    const tasks = await prisma.task.findMany({
      where: {
        teacherId: userId,
      },
    });
    return res.json(tasks);
  }
  const tasks = await prisma.task.findMany({
    where: {
      classId: user.class.id,
    },
  });
  const userTasks = await prisma.userTask.findMany({
    where: { userId },
  });
  const transformedTasks = tasks.map((task) => {
    const userTask = userTasks.find((userTask) => userTask.taskId === task.id);
    return {
      ...task,
      deliveredAt: userTask?.deliveredAt,
      content: userTask?.content,
    };
  });
  return res.json(transformedTasks);
}

async function findOne(req, res, prisma) {
  const { id } = req.params;
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { class: true },
  });
  const theTask = await prisma.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }

  if (user.type === "student") {
    const doubts = await prisma.doubt.findMany({
      where: {
        taskId: theTask.id,
        studentId: userId,
      },
    });
    const [userTask] = await prisma.userTask.findMany({
      where: {
        taskId: theTask.id,
        userId,
      },
    });
    return res.json({
      ...theTask,
      studentId: userId,
      doubts,
      deliveredAt: userTask?.deliveredAt,
      content: userTask?.content,
    });
  }

  const doubts = await prisma.doubt.findMany({
    where: {
      taskId: theTask.id,
    },
  });
  const students = await prisma.user.findMany({
    where: {
      classId: theTask.classId,
      type: "student",
    },
  });
  const userTasks = await prisma.userTask.findMany({
    where: {
      taskId: theTask.id,
    },
  });
  const transformedStudents = students.map((student) => {
    const userTask = userTasks.find(
      (userTask) => userTask.userId === student.id
    );
    delete student.password;
    return {
      ...student,
      doubts: doubts.filter((doubt) => doubt.studentId === student.id),
      content: userTask?.content,
      deliveredAt: userTask?.deliveredAt,
    };
  });
  return res.json({ ...theTask, students: transformedStudents });
}

async function create(req, res, prisma) {
  const { classId, title, description, deadline } = req.body;
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user.type !== "teacher") {
    return res
      .status(403)
      .json({ message: "Apenas professores podem criar tarefas." });
  }
  const theClass = await prisma.class.findUnique({
    where: { id: Number(classId) },
  });
  if (!theClass) {
    return res.status(404).json({ message: "Turma não encontrada." });
  }
  const theTask = await prisma.task.create({
    data: {
      teacherId: userId,
      classId,
      title,
      description,
      deadline,
    },
  });
  return res.json(theTask);
}

async function createDoubt(req, res, prisma) {
  const { id } = req.params;
  const { to, message } = req.body;
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  const data = {
    taskId: Number(id),
    message,
  };
  if (user.type === "student") {
    data.studentId = userId;
    data.teacherId = to;
    data.type = "student";
  } else {
    data.teacherId = userId;
    data.studentId = to;
    data.type = "teacher";
  }
  await prisma.doubt.create({ data });
  return res.send(204);
}

async function delivery(req, res, prisma) {
  const { id } = req.params;
  const theTask = await prisma.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }
  const { content } = req.body;
  await prisma.userTask.create({
    data: {
      taskId: Number(id),
      userId: req.userId,
      deliveredAt: new Date(),
      content,
    },
  });
  return res.send(204);
}

async function update(req, res, prisma) {
  const { id } = req.params;
  const theTask = await prisma.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }
  const { classId, title, description, deadline } = req.body;
  await prisma.task.update({
    where: { id: Number(id) },
    data: {
      classId,
      title,
      description,
      deadline,
    },
  });
  return res.send(204);
}

async function remove(req, res, prisma) {
  const { id } = req.params;
  const theTask = await prisma.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }
  await prisma.task.delete({
    where: { id: Number(id) },
  });
  return res.send(204);
}

module.exports = taskController;
