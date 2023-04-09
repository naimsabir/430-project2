const models = require('../models');

const { Domo } = models;

const quotePage = async (req, res) => res.render('quotes');

module.exports = {quotePage};