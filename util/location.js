const axios = require("axios");
const HttpError = require("../models/http-error");
const API_KEY = "AIzaSyCToCyJC577rddNei0b_t5upjHOXodORhE";

const getCoordinatesForAddress = async (address) => {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${API_KEY}`
    );

    const data = response.data;
    if (!data || data.status == "ZERO_RESULTS") {
        const error = new HttpError(
            "Could not find address in Google map",
            422
        );
        throw error;
    }
    return data.results[0].geometry.location;
};

module.exports = getCoordinatesForAddress;
