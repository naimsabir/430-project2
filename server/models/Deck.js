const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema
({
    character:
    {
        type: String,
        required: true,
    },
    power:
    {
        type: String,
        required: true,
    },
    weakness:
    {
        type: String,
        required: true,
    },
    owner:
    {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
});

DeckSchema.statics.toAPI = (doc) => 
({
    character: doc.character,
    power: doc.power,
    weakness: doc.weakness,
});

const DeckModel = mongoose.model('Deck', DeckSchema);
module.exports = DeckModel;