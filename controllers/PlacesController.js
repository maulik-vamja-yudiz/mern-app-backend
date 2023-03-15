const HttpError = require("../models/http-error.js");
const fs = require("fs");
const { validationResult } = require("express-validator");
const { v4: uuid } = require("uuid");
const getCoordinatesForAddress = require("../util/location");
const Place = require("../models/Place");
const User = require("../models/User");
const mongoose = require("mongoose");

const Home = (req, res, next) => {
    console.log("GET request in places");
    res.json({
        message: "It Works",
    });
};

const getPlacesByPlaceId = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        return next(new HttpError("Something went wrong", 500));
    }
    if (!place || place.length == 0) {
        return next(
            new HttpError("could not find place with id '" + placeId + "'", 404)
        );
    }
    res.json({ place: place.toObject({ getters: true }) });
    // Getters method response ma "id" name ni key ni  aagal thi __ remove kare che . actually e new row add kari dei che id name ni _ remove kari ne.
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    let userPlaces;
    try {
        // places = Place.where("creator").equals(userId);
        // places = await Place.find({ creator: userId });
        userPlaces = await User.findById(userId).populate("places");
    } catch (error) {
        return next(new HttpError("Something went wrong", 500));
    }
    // if (!userPlaces || userPlaces.places.length == 0) {
    //     return next(
    //         new HttpError("could not find place for the user " + userId, 404)
    //     );
    // }
    // 2 rite error throw thai banne function ma alag alag way use karelo che
    // error throw no use karine and biju next() method ma error pass kari ne
    res.json({
        places: userPlaces
            ? userPlaces.places.map((place) =>
                  place.toObject({ getters: true })
              )
            : [],
    });
};

const createPlace = async (req, res, next) => {
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
        return next(
            new HttpError(
                "Invalid Inputs passed, Please Provide valid Inputs",
                422
            )
        );
    }
    const { title, description, address, creator } = req.body;
    let coordinates;
    try {
        coordinates = await getCoordinatesForAddress(address);
    } catch (error) {
        return next(error);
    }
    const createdPlace = new Place({
        title,
        description,
        image: req.file.path,
        address,
        location: coordinates,
        creator,
    });
    let user;
    try {
        user = await User.findById(creator);
    } catch (error) {
        return next(new HttpError(error, 500));
    }

    if (!user) {
        return next(
            new HttpError("Could not foung the user you provided id.", 400)
        );
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError(err, 500));
    }
    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
        throw new HttpError(
            "Invalid Inputs passed, Please Provide valid Inputs",
            422
        );
    }
    const placeId = req.params.placeId;
    const { title, description } = req.body;
    let updatable_place;
    try {
        updatable_place = await Place.findById(placeId);
    } catch (error) {
        return next(new HttpError("Something went wrong", 500));
    }

    if (updatable_place.creator.toString() !== req.userData.userId) {
        //creator property is not an normal json property, it is the refrenced object id of the users. we need to convert it to the string first.
        return next(new HttpError("You can not access this resource", 401));
    }
    updatable_place.title = title;
    updatable_place.description = description;
    try {
        updatable_place.save();
    } catch (error) {
        return next(new HttpError("Something went wrong", 500));
    }

    res.status(200).json({
        data: {
            place: updatable_place.toObject({ getters: true }),
        },
        message: "Place is updated SuccessFully",
    });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.placeId;
    let isPlaceExists;
    try {
        isPlaceExists = await Place.findById(placeId).populate("creator");
        //populate() method will give proper object of the user. Same like (with eloquent method)
    } catch (error) {
        return next(
            new HttpError(
                "Something went wrong in fetching data for Deleting Place",
                500
            )
        );
    }
    if (!isPlaceExists)
        return next(
            new HttpError("Data is not available for this placeId", 404)
        );
    if (isPlaceExists.creator.id !== req.userData.userId) {
        return next(new HttpError("You can not access this resource", 401));
    }
    const imagePath = isPlaceExists.image;
    console.log(imagePath);
    try {
        // DB Transaction
        const dbSession = await mongoose.startSession();
        dbSession.startTransaction();
        await isPlaceExists.remove({ session: dbSession });
        isPlaceExists.creator.places.pull(isPlaceExists);
        await isPlaceExists.creator.save({ session: dbSession });

        await dbSession.commitTransaction();
    } catch (error) {
        return next(new HttpError(error, 500));
    }
    fs.unlink(imagePath, (err) => console.log(err));
    res.status(200).json({ message: "Place Deleted successfully" });
};

exports.Home = Home;
exports.getPlacesByPlaceId = getPlacesByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
