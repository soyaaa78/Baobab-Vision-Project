const express = require("express");
const router = express.Router();
const {
  pop_get,
  pop_post,
  pop_patch,
  pop_delete,
} = require("../controllers/proofOfPaymentController");

router.get("/", pop_get);
router.post("/", pop_post);
router.patch("/", pop_patch);
router.delete("/", pop_delete);

module.exports = router;
