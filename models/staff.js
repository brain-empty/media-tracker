const mongoose = require ('mongoose');

const worksSchema = new mongoose.Schema ({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_roles'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"character"
    }
})

const staffSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true,
    },
    works : [worksSchema],
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