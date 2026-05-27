const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const { getOrderCounts } = require("../controllers/orderCountsController");

router.use(authenticate);
router.get("/", getOrderCounts);

module.exports = router;