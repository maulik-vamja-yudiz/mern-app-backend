const express = require("express");
const PlacesController = require("../controllers/PlacesController");
const { check } = require("express-validator");
const router = express.Router();
const fileUpload = require("../middleware/fileUploadMiddleware");
const Auth = require("../middleware/AuthMiddleware");

router.get("/", PlacesController.Home);

router.get("/:placeId", PlacesController.getPlacesByPlaceId);

router.use(Auth);

router.get("/user/:userId", PlacesController.getPlacesByUserId);

router.post(
    "/create",
    fileUpload.single("placeImage"),
    [
        check("title").not().isEmpty(),
        check("description").isLength({ min: 5 }),
        check("address").notEmpty(),
    ],
    PlacesController.createPlace
);

router.patch(
    "/update/:placeId",
    [
        check("title").notEmpty(),
        check("description").notEmpty().isLength({ min: 5 }),
    ],
    PlacesController.updatePlace
);

router.delete("/:placeId", PlacesController.deletePlace);
module.exports = router;
