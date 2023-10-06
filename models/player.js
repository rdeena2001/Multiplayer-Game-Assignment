const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    username: String,
    score: Number,
  });
  
  const Player = mongoose.model('Players', playerSchema);
  

  module.exports = Player