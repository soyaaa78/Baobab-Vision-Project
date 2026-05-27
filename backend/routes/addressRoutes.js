const express = require("express");
const router = express.Router();
const {
  address_get,
  address_post,
  address_patch,
  address_delete,
} = require("../controllers/addressController");

router.get("/", address_get);
router.post("/", address_post);
router.patch("/", address_patch);
router.delete("/", address_delete);

module.exports = router;
