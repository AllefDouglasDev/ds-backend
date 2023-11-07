const { Router } = require("express");
const { verifyToken } = require("./jwt");

function taskController(db) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, db));
  router.get("/:id", verifyToken, (req, res) => findOne(req, res, db));
  router.post("/", verifyToken, (req, res) => create(req, res, db));
  router.post("/:id/delivery", verifyToken, (req, res) =>
    delivery(req, res, db)
  );
  router.post("/:id/doubt", verifyToken, (req, res) =>
    createDoubt(req, res, db)
  );
  router.put("/:id", verifyToken, (req, res) => update(req, res, db));
  router.delete("/:id", verifyToken, (req, res) => remove(req, res, db));
  return router;
}

async function list(req, res, db) {
  const userId = req.userId;
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { class: true },
  });
  if (user.type === "teacher") {
    const tasks = await db.task.findMany({
      where: {
        teacherId: userId,
      },
    });
    return res.json(tasks);
  }
  const tasks = await db.task.findMany({
    where: {
      classId: user.class.id,
    },
  });
  const userTasks = await db.userTask.findMany({
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

async function findOne(req, res, db) {
  const { id } = req.params;
  const userId = req.userId;
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { class: true },
  });
  const theTask = await db.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }

  if (user.type === "student") {
    const doubts = await db.doubt.findMany({
      where: {
        taskId: theTask.id,
        studentId: userId,
      },
    });
    const [userTask] = await db.userTask.findMany({
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

  const doubts = await db.doubt.findMany({
    where: {
      taskId: theTask.id,
    },
  });
  const students = await db.user.findMany({
    where: {
      classId: theTask.classId,
      type: "student",
    },
  });
  const userTasks = await db.userTask.findMany({
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

async function create(req, res, db) {
  const { classId, title, description, deadline } = req.body;
  const userId = req.userId;
  const user = await db.user.findUnique({
    where: { id: userId },
  });
  if (user.type !== "teacher") {
    return res
      .status(403)
      .json({ message: "Apenas professores podem criar tarefas." });
  }
  const theClass = await db.class.findUnique({
    where: { id: Number(classId) },
  });
  if (!theClass) {
    return res.status(404).json({ message: "Turma não encontrada." });
  }
  const theTask = await db.task.create({
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

async function createDoubt(req, res, db) {
  const { id } = req.params;
  const { to, message } = req.body;
  const userId = req.userId;
  const user = await db.user.findUnique({
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
  await db.doubt.create({ data });
  return res.send(204);
}

async function delivery(req, res, db) {
  const { id } = req.params;
  const theTask = await db.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }
  const { content } = req.body;
  await db.userTask.create({
    data: {
      taskId: Number(id),
      userId: req.userId,
      deliveredAt: new Date(),
      content,
    },
  });
  return res.send(204);
}

async function update(req, res, db) {
  const { id } = req.params;
  const theTask = await db.task.findUnique({
    where: { id: Number(id) },
  });
  if (!theTask) {
    return res.status(404).json({ message: "Tarefa não encontrada." });
  }
  const { classId, title, description, deadline } = req.body;
  await db.task.update({
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

async function remove(req, res, db) {
  const { id } = req.params;
  db.query("DELETE FROM task WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }
    return res.sendStatus(204);
  })
}

module.exports = taskController;
