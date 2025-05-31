const mongoose = require("mongoose");

const starsPointSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true
    },
    starsAmount: {
        type: Number,
        required: true
    },
    starsBonus: {
        type: Number,
        required: true
    },
    price: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("starsPoint", starsPointSchema);