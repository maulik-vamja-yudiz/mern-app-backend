const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    image: {
        type: String,
        required: true,
    },
    places: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Place",
            required: true,
        },
    ],
});

UserSchema.plugin(uniqueValidator); // it will add the uniqueValidator to the field which has the unique property in the schema. It is the Third party plugin.

module.exports = mongoose.model("User", UserSchema);
