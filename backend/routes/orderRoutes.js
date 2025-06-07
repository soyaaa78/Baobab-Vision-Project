const express = require("express");
const router = express.Router();
const {
  order_get,
  order_post,
  order_put,
  order_delete,
} = require("../controllers/orderController");

router.get("/", order_get);
router.post("/", order_post);
router.put("/", order_put);
router.delete("/", order_delete);

module.exports = router;