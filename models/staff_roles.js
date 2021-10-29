const mongoose = require ('mongoose');

const genericRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

const actorRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    character: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"character"
    }
});

module.exports = mongoose.model ('GenericRole', genericRoleSchema)
module.exports = mongoose.model ('ActorRole', actorRoleSchema)