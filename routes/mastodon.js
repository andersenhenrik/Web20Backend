var express = require('express');
var router = express.Router();
const bs58 = require('bs58');

const crypto = require('../src/encryption');
const middleware = require('../middleware');
const DbAccess = require('../src/db_access');
const MastApi = require('../src/mastodon_api');

const dbName = 'userdb';
const collection = 'users';

router.use(express.json());
/* Endpoint /register expects as POST request with a attached JSON of the following format:
{
    'instanceUrl' : 'valid url of mastodon instance'
}
  Returns a url for the user where he can generate a authentification code via logging into
  the provided instance account. Generated authentification code is used in /register/auth.
*/

router.post('/register', middleware.checkToken, (req, res) => {
  // Check if instance url is provided in request
  if (req.body.instanceUrl == '' || req.body.instanceUrl == undefined) {
    res.status(400);
    res.end('No instanceUrl provided!');
  }
  // Check if userId is provided in request
  /*if (req.body.userId == '' || req.body.userId == undefined) {
    res.status(400);
    res.end('No userId provided!');
  }*/
  var { userId } = req.decoded
  var Mast = new MastApi(req.body.instanceUrl);
  Mast.getAuthUrl()
    .catch( (err) => {
      res.sendStatus(400);
    })
    .then( (params) => {

      var Db = new DbAccess(dbName, collection);
      Db.doesUserIdExist(userId)
        .catch( (err) => {
          res.status(400);
          res.end('No user with given Id existing!');
        })
        .then( () => Db.updateMastId(userId, crypto.encrypt(params.clientId)))
        .then( () => Db.updateMastSecret(userId, crypto.encrypt(params.clientSecret)))
        .then( () => Db.updateMastUrl(userId, crypto.encrypt(req.body.instanceUrl)))
        .then( () => {
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify( {
            'authUrl' : params.authUrl,
            'message' : 'Authenticate via given URL!',
            'success' : true } ));
        })
    })
});

router.post('/register/auth', middleware.checkToken, (req, res) => {
  // Check if authorization code is provided
  if (req.body.authCode == '' || req.body.authCode == undefined) {
    //console.error('No authorization code provided!');
    res.status(400);
    res.end('No authorization code provided!');
  }
  // Check if user id is provided in request
  /*if (req.body.userId == '' || req.body.userId == undefined) {
    res.status(400);
    res.end('No userId provided!');
  }
  */
  // Check if instance url is provided in request
  /*if (req.body.instanceUrl == '' || req.body.instanceUrl == undefined) {
    res.status(400);
    res.end('No instanceUrl provided!');
  }*/

  //var Mast = new MastApi(req.body.instanceUrl)
  var { userId } = req.decoded;
  var Db = new DbAccess(dbName, collection);
  Db.doesUserIdExist(userId)
    .catch( (err) => {
      res.status(400);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify( {
        'message' : 'User not found! Authentification Token may be expired?',
        'success' : false } ));
    })
    .then( () => {
      Db.getMastodonInfos(userId)
        .then( (mastInfos) => {
          let Mast = new MastApi(crypto.decrypt(mastInfos.instance));
          Mast.generateAccessToken(req.body.authCode,
            crypto.decrypt(mastInfos.mastId),
            crypto.decrypt(mastInfos.mastSecret))
            .catch( (err) => {
              res.status(500);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify( {
                'message' : 'Error while linking mastodon account!',
                'success' : false } ));
            })
            .then( (accessToken) => {
              Db.updateMastToken(userId, crypto.encrypt(accessToken))
              res.status(200);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify( {
                'message' : 'Mastodon account successfully linked!',
                'success' : true } ));
            })
        })
    })
});

router.post('/post', middleware.checkToken, (req, res) => {
  // Check if user id is provided in request
  /*if (req.body.userId == '' || req.body.userId == undefined) {
    res.status(400);
    res.end('No userId provided!');
  }*/
  // Collect all neccessary data
  var { userId } = req.decoded
  console.log(userId);
  var Db = new DbAccess(dbName, collection);
  Db.doesUserIdExist(/*req.body.userId*/ userId)
    .catch( (err) => {
      res.status(400);
      res.end('No existing user with given Id!');
    })
    .then( () => {
      Db.getMastodonInfos(/*req.body.userId*/ userId)
      .then( (params) => {
        var Mast = new MastApi(crypto.decrypt(params.instance));
        Mast.setClientId(crypto.decrypt(params.mastId));
        Mast.setClientSecret(crypto.decrypt(params.mastSecret));
        Mast.setAccessToken(crypto.decrypt(params.accessToken));

        Mast.toot(req.body.message)
        .catch( (err) => {
          res.status(500);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify( {
            'message' : err,
            'success' : false } ));
        })
        .then( (success) => {
          res.status(200)
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify( {
            'message' : 'Posted status on Mastodon!',
            'success' : success } ));
        })
      })
    })
})

module.exports = router;
