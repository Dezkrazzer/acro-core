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
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("starsPoint", starsPointSchema);