var express = require('express');
var router = express.Router();
const bs58 = require('bs58');

const crypto = require('../src/encryption');
const middleware = require('../middleware');
const DbAccess = require('../src/db_access');
const TwitterAPI = require('../src/twitter_api');
const { Db } = require('mongodb');

const dbName = 'userdb';
const collection = 'users';

router.use(express.json());

router.post('/register', middleware.checkToken, (req,res) => {

    var { userId } = req.decoded
    var Twitter = new TwitterAPI;
    Twitter.getTwitterRequestToken()
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
                .then( () => Db.updateTwitterOAuthToken(userId, crypto.encrypt(params.reqTkn)))
                .then( () => {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify( {
                        'authUrl' : 'https://api.twitter.com/oauth/authorize?oauth_token=' + params.reqTkn,
                        'message' : 'Authorize via given URL!',
                        'success' : true } ));
                })              
        })
});

router.get('/register/callback', (req,res) => {

    var Twitter = new TwitterAPI;
    Twitter.getTwitterAccessToken(req.query.oauth_token, req.query.oauth_verifier)
        .catch( (err) => {
            res.sendStatus(400);
        })
        .then( (params) => {      
            var DB = new DbAccess(dbName, collection);
            DB.updateTwitterAccessTokenKey(crypto.encrypt(req.query.oauth_token), crypto.encrypt(params.accTkn))
            DB.updateTwitterAccessTokenKeySecret(crypto.encrypt(req.query.oauth_token), crypto.encrypt(params.accTknSecret))
        })
    res.render('callback', {title: 'Twitter Callback'});

});

router.post('/post', middleware.checkToken, (req,res) => {

    var { userId } = req.decoded;
    var Db = new DbAccess(dbName, collection);
    Db.doesUserIdExist(userId)
    .catch( (err) => {
      res.status(400);
      res.end('No existing user with given Id!');
    })
    .then( () => {
      Db.getTwitterInfos(userId)
      .then( (params) => {
        var Twitter = new TwitterAPI();
        Twitter.tweet(req.body.message, crypto.decrypt(params.accessTokenKey), crypto.decrypt(params.accessTokenKeySecret))
        .catch( (err) => {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify( {
              'message' : err,
              'success' : false } ));
          })
          .then( () => {
            res.status(200)
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify( {
              'message' : 'Posted tweet on Twitter!' } ));
          })
      })
    }) 




});

module.exports = router;