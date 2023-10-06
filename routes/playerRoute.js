const PlayerController = require('../controller/playerController')
const express = require('express')
const router = express.Router();


router.post('/registerplayer', async function(req, res){
    console.log(req.body)

    let response = {};
    try {
        
        
        let result = await PlayerController.registerPlayerInfo(req.body.username);
        if (result) {
            return  res.status(201).send({response:{Message:"user Created Let's Start Game"}});
        }
    } catch (err) {
        console.log(err);
    }

    return res.status(404).send({response:{Message:"user not Created"}});
})

router.get('/getleaderboard', async function(req, res){
console.log(req.body)
    let response= {};
    try {
        let result = await PlayerController.getPlayerInfo(req.body.username);
        if (result) {
    
            return res.status(201).send({response:{data:result}});
        }
    } catch (err) {
        console.log(err);
    }

    return res.status(404).send({response:{Message:"unable to get UserDetails"}});
})

router.put('/updatescore', async function(req, res){
console.log(req.body)
    let response ={};
    try {
        let result = await PlayerController.updateScore(req.body.username, req.body.score);
        if (result) {
            return res.status(201).send({response:{Message:"score updated"}});
        }
    } catch (err) {
        console.log(err);
    }

    return res.status(400).send({response:{Message:"Score not updated"}});
})


module.exports=router;