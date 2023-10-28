const jwt = require("jsonwebtoken");
const { Router } = require("express");
const bcrypt = require("bcrypt");
const { secretKey } = require("./constants");
const { verifyToken } = require("./jwt");

function authController(prisma) {
  const router = Router();
  router.post("/login", (req, res) => login(req, res, prisma));
  router.get("/profile", verifyToken, (req, res) => profile(req, res, prisma));
  return router;
}

async function login(req, res, prisma) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = jwt.sign({ userId: user.id }, secretKey);
      delete user.password;
      res.json({ token, user });
    } else {
      res.status(401).json({ message: "Credenciais inválidas." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function profile(req, res, prisma) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });
  if (!user) {
    return res.status(401).json({ message: "Usuário não encontrado." });
  }
  delete user.password;
  return res.json(user);
}

module.exports = authController;
