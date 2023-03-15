const express = require("express");
const bodyParser = require("body-parser");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept,Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,PATCH,POST,DELETE");
    next();
});

app.use("/api/places", placesRoutes); //it will add the prefix to the places - routes
app.use("/api/", usersRoutes); //it will add the prefix to the users - routes

app.use(
    "/uploads/images/users",
    express.static(path.join("uploads", "images", "users"))
); // This middleware is used for the file display at the frontend. without this no image will be displayed
app.use(
    "/uploads/images/places",
    express.static(path.join("uploads", "images", "places"))
); // This middleware is used for the file display at the frontend. without this no image will be displayed

app.use((req, res, next) => {
    throw new HttpError("Could not find this Resource", 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (req.headerSent) return next(error);

    res.status(error.code || 500).json({
        message: error.message || "An unknown error occurred",
    });
}); // this is the middlware for the default error handler. jo badha middleware ma common error hoi to e ahiya define kari shakiye.
mongoose.set("strictQuery", true);
mongoose
    .connect(
        "mongodb://localhost:27017/mern_app_demo?replicaSet=local-rs&readPreference=primary"
    )
    .then(() => {
        app.listen(5000);
    })
    .catch((error) => {
        console.log(error.message);
    });
