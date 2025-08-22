const express = require("express");
const router = express.Router();
const {
  rating_get,
  rating_post,
  rating_patch,
  rating_delete,
} = require("../controllers/ratingController");

router.get("/", rating_get);
router.post("/", rating_post);
router.patch("/", rating_patch);
router.delete("/", rating_delete);

module.exports = router;
