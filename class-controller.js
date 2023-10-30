const { Router } = require("express");
const { verifyToken } = require("./jwt");

function classController(prisma) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, prisma));
  return router;
}

async function list(req, res, prisma) {
  const classes = await prisma.class.findMany();
  return res.json(classes);
}

module.exports = classController;
