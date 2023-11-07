const { Router } = require("express");
const { verifyToken } = require("./jwt");

function eventController(db) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, db));
  router.get("/:id", verifyToken, (req, res) => findOne(req, res, db));
  router.post("/", verifyToken, (req, res) => create(req, res, db));
  router.put("/:id", verifyToken, (req, res) => update(req, res, db));
  router.delete("/:id", verifyToken, (req, res) => remove(req, res, db));
  return router;
}

async function list(req, res, db) {
  db.query("SELECT * FROM event", async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    res.json(result);
  });
}

async function findOne(req, res, db) {
  const { id } = req.params;
  db.query("SELECT * FROM event WHERE id = ?", [id], async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }
    res.json(result[0]);
  });
}

async function create(req, res, db) {
  const { title, start, end } = req.body;
  const formattedStart = new Date(start)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const formattedEnd = new Date(end)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  db.query(
    "INSERT INTO event (title, start, end) VALUES (?, ?, ?)",
    [title, formattedStart, formattedEnd],
    async (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      res.status(201).json({ success: true });
    }
  );
}

async function update(req, res, db) {
  const { id } = req.params;
  const { title, start, end } = req.body;
  const formattedStart = new Date(start)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const formattedEnd = new Date(end)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  db.query("UPDATE event SET title = ?, start = ?, end = ? WHERE id = ?", [
    title,
    formattedStart,
    formattedEnd,
    id,
  ], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error", error: err.message });
      return
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }
    return res.sendStatus(204);
  })
}

async function remove(req, res, db) {
  const { id } = req.params;
  db.query("DELETE FROM event WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error", error: err.message });
      return
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }
    return res.sendStatus(204);
  })
}

module.exports = eventController;
