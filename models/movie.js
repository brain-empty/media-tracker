const mongoose = require ('mongoose');

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
        type : String
        // type: mongoose.Schema.Types.ObjectId
    }],
    tags:[{
        type: String
    }]
});

module.exports = mongoose.model ('Movie', movieSchema)
module.exports.coverImageBasePath = coverImageBasePath