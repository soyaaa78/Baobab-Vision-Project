const express = require("express");
const router = express.Router();
const {
  rating_get,
  rating_post,
  rating_patch,
  rating_delete,
} = require("../controllers/ratingController");
const authenticate = require("../middlewares/authMiddleware");

// all rating routes require auth
router.use(authenticate);

router.get("/", rating_get);
router.post("/", rating_post);
router.patch("/", rating_patch);
router.delete("/", rating_delete);

module.exports = router;
