const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
    let users;
    try {
        // users = await User.find({}, "name email"); // only name and email
        users = await User.find({}, "-password"); // password sivai nu badhu j
    } catch (error) {
        return next(
            new HttpError("Something went wrong while getting users", 500)
        );
    }
    res.status(200).json({
        users: users.map((user) => {
            return user.toObject({ getters: true });
        }),
    });
};
const signup = async (req, res, next) => {
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
        return next(
            new HttpError(
                "Invalid Inputs passed, Please Provide valid Inputs",
                422
            )
        );
    }
    const { name, email, password } = req.body;
    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (error) {
        return next(new HttpError("Something while getting the user", 500));
    }
    if (user)
        return next(
            new HttpError("This email is already exist. Try to Login", 422)
        );
    let createdUser;
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(new HttpError("Error storing User", 500));
    }
    try {
        createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            image: req.file.path,
            places: [],
        });
    } catch (error) {
        return next(new HttpError(error, 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            "authentication_web_token",
            { expiresIn: "1h" }
        );
    } catch (error) {
        return next(new HttpError("Error in token creation", 500));
    }

    res.status(200).json({
        user: createdUser.toObject({ getters: true }),
        token,
    });
};
const login = async (req, res, next) => {
    const { email, password } = req.body;
    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (error) {
        return next(
            new HttpError("Somwthing went wrong while getting user", 500)
        );
    }
    if (!user) return next(new HttpError("Provide valid email address", 401));

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, user.password);
    } catch (error) {
        return next(
            new HttpError(
                "Password is incorrect, Please enter Correct Password",
                500
            )
        );
    }

    if (!isValidPassword)
        return next(new HttpError("Password is incorrect", 401));

    let token;
    try {
        token = jwt.sign(
            { userId: user.id, email: user.email },
            "authentication_web_token",
            { expiresIn: "1h" }
        );
    } catch (error) {
        return next(new HttpError("Error in token creation", 500));
    }

    res.status(200).json({
        user: user.toObject({ getters: true }),
        token,
        message: "Succesfully Logged In",
    });
};

exports.signup = signup;
exports.getUsers = getUsers;
exports.login = login;
