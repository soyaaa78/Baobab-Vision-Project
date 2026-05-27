const express = require("express");
const router = express.Router();
const {
  order_get,
  order_post,
  order_put,
  order_delete,
  checkoutFromCart,
} = require("../controllers/orderController");
const authenticate = require("../middlewares/authMiddleware");

router.use(authenticate);

router.get("/", order_get);
router.post("/", order_post);
router.put("/", order_put);
router.delete("/", order_delete);
router.post("/checkout", checkoutFromCart);

module.exports = router;
