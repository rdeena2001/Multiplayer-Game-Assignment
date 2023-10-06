const  Players = require('./player')


module.exports.registerPlayer = async function ( username) {
    let registerPlayer;
    try {

        let checkUser = await Players.findOne({username})
       if(checkUser){
        return false;
       
       }
       registerPlayer = await Players.create({username , score : 0})
        return true
    } catch (err) {
        console.log(err);
    }
    return false;
}

module.exports.getLeaderboard = async function (username) {
    let getLeaderboard;
    try {
        // getLeaderboard = await Players.findOne({
        //     username: username
        // });
    } catch (err) {
        console.log(err);
    }
    return getLeaderboard;
}

module.exports.updateScore = async function (username, score) {
    let updateScore;
    try {
    let newScore = score;
        const user = await Players.findOne({ username: username });

        if (!user) {
            console.log('User not found');
            return false;
        }

        // Calculate the updated score by adding the new score to the current score
        const updatedScore = user.score + newScore;
         updateScore = await Players.findOneAndUpdate(
            { username: username },
            { $set: { score: updatedScore } },
            { new: true } // Return the updated document
        );
        console.log(updateScore,"333")
        return true
    } catch (err) {
        console.log(err);
    }
    return false;
}