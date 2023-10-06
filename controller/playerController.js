const  PlayerModel = require('../models/query');

module.exports.registerPlayerInfo = async function (username) {
    let registerPlayerInfo;
    try {
        registerPlayerInfo = await PlayerModel.registerPlayer(username);
         return true
    } catch (err) {
        console.log(err);
    }
    return false;
}

module.exports.getPlayerInfo = async function (username) {
    let getPlayerInfo;
    try {
        getPlayerInfo = await PlayerModel.getLeaderboard(username);
    } catch (err) {
        console.log(err);
    }
    return getPlayerInfo;
}

// Don't use it because we need to update in subcategories as well since it takes this name as well
module.exports.updateScore = async function (username, score) {
    let updateScore;
    try {
        updateScore = await PlayerModel.updateScore(username, score);
        if (updateScore) {
            return true;
        }
    } catch (err) {
        console.log(err);
    }
    return false;
}