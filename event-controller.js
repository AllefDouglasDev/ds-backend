const { Router } = require("express");
const { verifyToken } = require("./jwt");

function eventController(prisma) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, prisma));
  router.get("/:id", verifyToken, (req, res) => findOne(req, res, prisma));
  router.post("/", verifyToken, (req, res) => create(req, res, prisma));
  router.put("/:id", verifyToken, (req, res) => update(req, res, prisma));
  router.delete("/:id", verifyToken, (req, res) => remove(req, res, prisma));
  return router;
}

async function list(req, res, prisma) {
  const events = await prisma.event.findMany();
  return res.json(events);
}

async function findOne(req, res, prisma) {
  const { id } = req.params;
  const theEvent = await prisma.event.findUnique({
    where: { id: Number(id) },
  })
  if (!theEvent) {
    return res.status(404).json({ message: "Evento não encontrado." });
  }
  return res.json(theEvent);
}

async function create(req, res, prisma) {
  const { title, start, end } = req.body;
  const theEvent = await prisma.event.create({
    data: {
      title,
      start,
      end,
    },
  });
  return res.json(theEvent);
}

async function update(req, res, prisma) {
  const { id } = req.params;
  const theEvent = await prisma.event.findUnique({
    where: { id: Number(id) },
  })
  if (!theEvent) {
    return res.status(404).json({ message: "Evento não encontrado." });
  }
  const { title, start, end } = req.body;
  await prisma.event.update({
    where: { id: Number(id) },
    data: {
      title,
      start,
      end,
    },
  });
  return res.sendStatus(204);
}

async function remove(req, res, prisma) {
  const { id } = req.params;
  const theEvent = await prisma.event.findUnique({
    where: { id: Number(id) },
  })
  if (!theEvent) {
    return res.status(404).json({ message: "Evento não encontrado." });
  }
  await prisma.event.delete({
    where: { id: Number(id) },
  });
  return res.sendStatus(204);
}

module.exports = eventController;
