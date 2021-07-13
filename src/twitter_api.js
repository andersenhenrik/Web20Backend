const Twitter = require('twitter-lite');
const fs = require('fs');
require("dotenv").config();

class TwitterAPI{

    constructor(){

        this.consum_key = process.env.TWITTER_CONSUMER_KEY;
        this.consum_secret = process.env.TWITTER_CONSUMER_KEY_SECRET;
        this.access_tok = '';
        this.access_tok_secret = '';
    }


    getTwitterRequestToken(){

        return new Promise( (resolve,reject) => {

            const client = new Twitter({
                consumer_key : this.consum_key,
                consumer_secret : this.consum_secret
            });
    
            client
                .getRequestToken("http://185.176.41.137:3000/twitter/register/callback")
                .catch(console.error)
                .then(res => {
                    let return_oauthtoken = {
                        reqTkn: res.oauth_token,
                        reqTknSecret: res.oauth_token_secret
                    };
                    resolve(return_oauthtoken);
                })
        })
    }


    getTwitterAccessToken(oauth_token, oauth_verifier){

        return new Promise( (resolve, reject) => {


            const client = new Twitter({
                consumer_key : this.consum_key,
                consumer_secret : this.consum_secret
            });
            
            client
                .getAccessToken({
                    oauth_verifier: oauth_verifier,
                    oauth_token: oauth_token
                })
                .catch(console.error) 
                .then(res => {
                    let return_accesstoken = {
                        accTkn: res.oauth_token,
                        accTknSecret: res.oauth_token_secret
                    };
                    resolve(return_accesstoken);
                })
        }) 
    }

    tweet(message, access_token, access_token_secret){

        return new Promise ( (resolve, reject) => {

            const client = new Twitter({

                consumer_key : this.consum_key,
                consumer_secret : this.consum_secret,
                access_token_key : access_token,
                access_token_secret : access_token_secret

            });

            client
                .post("statuses/update", {
                    status: message
                })
                .catch(console.error)
               /* .then(res => {

                    let creation_time = {
                        time: res.created_at
                    };
                    resolve (creation_time);
              })*/
        })
    }

    setTwitterAccessToken(access_token){
        this.access_tok = access_token;
    }

    setTwitterAccessTokenSecret(access_token_secret){
        this.access_tok_secret = access_token_secret;
    }

}
module.exports = TwitterAPI;
