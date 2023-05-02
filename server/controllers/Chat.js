const f = require('fs');
const models = require('../models');

const chatPage = async (req, res) => res.render('chat');

//const cardData = JSON.parse(f.readFileSync(`${__dirname}/../../hosted/card-data/cardtext.json`));
//console.log(cardData);

const { Deck } = models;

const makeDeck = async (req, res) =>
{
    if(!req.body.characterRand || !req.body.powerRand || !req.body.weaknessRand)
    {
        return res.status(400).json({ error: 'Something went wrong and none of the deck details came through' });
    }

    const deckData =
    {
        character: req.body.characterRand,
        power: req.body.powerRand,
        weakness: req.body.weaknessRand,
        owner: req.session.account._id,
    };

    try 
    {
        const newDeck = new Deck(deckData);
        await newDeck.save();
        return res.status(201).json({ character: newDeck.character, power: newDeck.power, weakness: newDeck.weakness });
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({ error: 'An error occured making deck!' });
    }
};

const getDeck = async (req, res) => {
    //using a try catch with the owner should make it so that whenever this is called it gets that users specific deck
    try {
      const query = { owner: req.session.account._id };
      const docs = await Deck.find(query).select('character power weakness').lean().exec();

      //await Deck.findOneAndDelete(query).select('character power weakness').lean().exec();
  
      return res.json({ deck: docs });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error retrieving deck!' });
    }
  };

module.exports = { 
    chatPage,
    makeDeck,
    getDeck,
 };
