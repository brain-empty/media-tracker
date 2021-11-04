const mongoose = require ('mongoose');

const staffSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
    },
    works : [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Staff_work"
    }],
    summary: {
        type: String
    },
    birthdate: {
        type: Date
    },
    coverImageName: {
        type: String
    }
});

module.exports = mongoose.model ('Staff', staffSchema)