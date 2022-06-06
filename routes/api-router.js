const express = require('express');
const path = require('path');
const apiRouter = express.Router();
const ApiController = require(global.__dirname+"/controllers/api-controller.js");


apiRouter.route('/validate')
    .post(ApiController.validate);

apiRouter.route('/save-game-record')
    .post(ApiController.saveGameRecord);

// apiRouter.route('/sign-guest')
//     .post(ApiController.signGuest);

module.exports = apiRouter;