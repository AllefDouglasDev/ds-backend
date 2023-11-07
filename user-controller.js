const bcrypt = require("bcrypt");
const { Router } = require("express");
const { verifyToken } = require("./jwt");

function userController(db) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, db));
  router.post("/", verifyToken, (req, res) => create(req, res, db));
  router.delete("/:id", verifyToken, (req, res) => remove(req, res, db));
  return router;
}

async function list(req, res, db) {
  db.query(
    `
    SELECT user.*, class.name AS className
    FROM user  
    LEFT JOIN class ON user.classId = class.id
    WHERE type = ?`,
    [req.query.type],
    (err, result) => {
      if (err) {
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      res.json(
        result.map(({ classId, className, ...item }) => ({
          ...item,
          class: className
            ? {
                id: classId,
                name: className,
              }
            : undefined,
        }))
      );
    }
  );
}

async function create(req, res, db) {
  const { name, email, type, password, classId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (type === "student") {
    db.query(
      `INSERT INTO user (name, email, password, type, classId) VALUES (?, ?, ?, ?, ?)`,
      [name, email.toLowerCase(), hashedPassword, type, classId],
      (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Internal Server Error", error: err.message });
          return;
        }
        return res.status(201).json({ success: true });
      }
    );
  } else {
    db.query(
      `INSERT INTO user (name, email, password, type) VALUES (?, ?, ?, ?)`,
      [name, email.toLowerCase(), hashedPassword, type],
      (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Internal Server Error", error: err.message });
          return;
        }
        return res.status(201).json({ success: true });
      }
    );
  }
}

async function remove(req, res, db) {
  const { id } = req.params;
  db.query("DELETE FROM user WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    return res.sendStatus(204);
  });
}

module.exports = userController;
