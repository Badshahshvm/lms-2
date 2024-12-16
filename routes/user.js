const express = require("express");
const { register, login, logout, getProfile, updateUser } = require("../controller/user");
const checkAuth = require("../middlewares/checkAuth");
const router = express.Router()

router.post("/new", register)
router.post("/", login)
router.get("/logout", checkAuth, logout)
router.get("/me", checkAuth, getProfile)
router.put("/update", checkAuth, updateUser)
module.exports = router;