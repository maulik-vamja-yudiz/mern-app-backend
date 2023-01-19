const express = require("express");
const { check } = require("express-validator");
const UsersController = require("../controllers/UsersController");
const router = express.Router();

router.get("/users", UsersController.getUsers);
router.post(
    "/signup",
    [
        check("name").notEmpty(),
        check("email").notEmpty().normalizeEmail().isEmail(),
        check("password").notEmpty().isLength({ min: 6 }),
    ],
    UsersController.signup
);
router.post("/login", UsersController.login);

module.exports = router;
