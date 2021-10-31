const mongoose = require ('mongoose');
const path = require ('path');
const coverImageBasePath = 'uploads/covers/movies'

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    summary: {
        type:String
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }],
    tags:[{
        type: String
    }],
    coverImageName: {
        type: String,
        required: false
    }
});

movieSchema.virtual ('coverImagePath').get (function() {
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model ('Movie', movieSchema)
module.exports.coverImageBasePath = coverImageBasePath