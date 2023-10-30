const bcrypt = require("bcrypt");
const { Router } = require("express");
const { verifyToken } = require("./jwt");

function userController(prisma) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, prisma));
  router.post("/", verifyToken, (req, res) => create(req, res, prisma));
  router.delete("/:id", verifyToken, (req, res) => remove(req, res, prisma));
  return router;
}

async function list(req, res, prisma) {
  const events = await prisma.user.findMany({ where: { type: { equals: req.query.type } } });
  return res.json(events);
}

async function create(req, res, prisma) {
  const { name, email, type, password, classId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (type === 'student') {
    try {
      const existingClass = await prisma.class.findUnique({
        where: {
          id: classId,
        },
      });
      if (!existingClass) {
        return res.status(404).json({ message: "Classe  não encontrada." });
      }
      const theUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword, // Senha criptografada
          type,
          class: {
            connect: {
              id: classId,
            },
          },
        },
      });
      return res.status(201).json(theUser);
    } catch (error) {
      return res.status(404).json({ message: "Error ao criar usuário" })
    }
  } else {
    try {
      const theUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword, // Senha criptografada
          type,
        },
      });
      return res.status(201).json(theUser);
    } catch (error) {
      return res.status(404).json({ message: "Error ao criar usuário" })
    }
  }
}

async function remove(req, res, prisma) {
  const { id } = req.params;
  const theUser = await prisma.user.findUnique({
    where: { id: Number(id) },
  })
  if (!theUser) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }
  await prisma.user.delete({
    where: { id: Number(id) },
  });
  return res.sendStatus(204);
}

module.exports = userController;

