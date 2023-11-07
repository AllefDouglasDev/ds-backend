const jwt = require("jsonwebtoken");
const { Router } = require("express");
const bcrypt = require("bcrypt");
const { secretKey } = require("./constants");
const { verifyToken } = require("./jwt");

function authController(db) {
  const router = Router();
  router.post("/login", (req, res) => login(req, res, db));
  router.get("/profile", verifyToken, (req, res) => profile(req, res, db));
  return router;
}

async function login(req, res, db) {
  const { email, password } = req.body;
  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return
    }    
    if (result.length === 0) {
      res.status(401).json({ message: "Usuário não encontrado." });
      return
    }
    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = jwt.sign({ userId: user.id }, secretKey);
      delete user.password;
      res.json({ token, user });
    } else {
      res.status(401).json({ message: "Credenciais inválidas." });
    }
  })
}

async function profile(req, res, db) {
  db.query("SELECT * FROM user WHERE id = ?", [req.userId], async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return
    }
    if (result.length === 0) {
      res.status(401).json({ message: "Usuário não encontrado." });
      return
    }
    const user = result[0];
    delete user.password;
    res.json(user);
  })
}

module.exports = authController;
