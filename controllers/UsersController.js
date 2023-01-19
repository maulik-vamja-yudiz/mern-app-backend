const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/User");

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
    console.log(req.body);
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
    try {
        createdUser = await User.create({
            name,
            email,
            password,
            image: "sbjdkjbvksbvasdbvkjjsad.jpg",
            places: [],
        });
    } catch (error) {
        return next(new HttpError(error, 500));
    }

    res.status(200).json({ user: createdUser.toObject({ getters: true }) });
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

    if (user.password !== password)
        return next(new HttpError("Password is incorrect", 401));

    res.status(200).json({
        user: user.toObject({ getters: true }),
        message: "Succesfully Logged In",
    });
};

exports.signup = signup;
exports.getUsers = getUsers;
exports.login = login;
