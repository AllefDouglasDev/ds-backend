const { Router } = require("express");
const { verifyToken } = require("./jwt");

function classController(db) {
  const router = Router();
  router.get("/", verifyToken, (req, res) => list(req, res, db));
  return router;
}

async function list(req, res, db) {
  db.query("SELECT * FROM class", async (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return
    }
    res.json(result);
  })
}

module.exports = classController;
