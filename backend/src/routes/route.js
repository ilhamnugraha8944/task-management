const express = require("express");
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");
const materialController = require("../controllers/materialController");
const { authenticateToken } = require("../middleware/middleware");

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

router.get("/tasks", authenticateToken, taskController.list);
router.post("/tasks", authenticateToken, taskController.add);
router.put("/tasks/:id", authenticateToken, taskController.edit);
router.delete("/tasks/:id", authenticateToken, taskController.remove);

router.get("/materials", materialController.list);
router.get("/materials/:id", materialController.get);
router.post("/materials", materialController.save);
router.put("/materials/:id", materialController.save);
router.delete("/materials/:id", materialController.remove);

module.exports = router;
