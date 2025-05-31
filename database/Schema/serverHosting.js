const mongoose = require("mongoose");

const serverHostingSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    amountRAM: {
        type: String,
        required: true
    },
    amountCPU: {
        type: String,
        required: true
    },
    amountStorage: {
        type: String,
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

module.exports = mongoose.model("serverHosting", serverHostingSchema);