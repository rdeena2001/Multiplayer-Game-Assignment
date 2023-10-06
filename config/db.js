const mongoose = require('mongoose')
const uri ="mongodb+srv://DeenaR:Deena123@test.ccmyoup.mongodb.net/multi_games"
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,  // Enable TLSSSL
});
const db = mongoose.connection;
try{
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
} catch(err){
  console.log(err)
}

module.exports= db
