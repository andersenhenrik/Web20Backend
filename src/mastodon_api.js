// This file should provide functions megafon needs,
// therefore acting as a own little API, using the functionality
// given by the mastodon-api by vanita5 found at
// https://github.com/vanita5/mastodon-api
const Mastodon = require('mastodon-api');
const fs = require('fs');

// matching strings in the form of mastodon instances
// e.g. mastodon.social / botsin.space / mastodon.conxtor.com
const instanceRegexp = /^\w+(\.\w+)+$/;

class MastApi {

  constructor(instanceUrl) {
    if ( !instanceRegexp.test(instanceUrl) ){
      console.error("Given instance URL has no valid syntax! Required form: \"foo.bar\"");
//TODO Check how to stop instanciating class
    }
    this.instanceUrl = instanceUrl;
    this.clientId = "";
    this.clientSecret = "";
    this.accessToken = "";
  }

  // Returns a URL to start a authentification process for a given Mastodon
  // instance url with following form: example.domain{.subdomains}
  getAuthUrl() {
    return new Promise( (resolve, reject) => {

      Mastodon.createOAuthApp(`https://${this.instanceUrl}/api/v1/apps`)
        .catch((err) => console.error(err))
        .then((res) => {

          this.clientId = res.client_id;
          this.clientSecret = res.client_secret;

          let authUrl = Mastodon.getAuthorizationUrl(
            this.clientId,
            this.clientSecret,
            `https://${this.instanceUrl}`
          )
          .then( (authUrl) => {
            let return_object = {
              clientId: this.clientId,
              clientSecret: this.clientSecret,
              authUrl: authUrl
            };
            resolve(return_object);
          })
        })
    })
  }

  generateAccessToken(authCode, clientId, clientSecret) {
    return new Promise( (resolve, reject) => {
      Mastodon.getAccessToken(
        clientId,
        clientSecret,
        authCode,
        `https://${this.instanceUrl}`
      )
      .catch((err) => {throw err})
      .then((accessToken) => {
        resolve(accessToken)
        /*
        this.accessToken = accessToken;
        this.mast = new Mastodon({
          access_token: this.accessToken,
          timeout_ms: 60 * 1000,
          api_url: `https://${this.instanceUrl}/api/v1`,
        })
        */
      });
    })
  }

  toot(
    message,
    img_path = "",
    sensitive = false,
    spoiler_text = "",
    visibility = "",
    in_reply_to_id = "",
  ) {
    return new Promise( (resolve, reject) => {
      var params = {
        status: message,
        sensitive: sensitive,
        spoiler_text: spoiler_text,
        visibility: visibility,
        in_reply_to_id: in_reply_to_id
      }

      var mast = new Mastodon({
        access_token: this.accessToken,
        timeout_ms: 60 * 1000,
        api_url: `https://${this.instanceUrl}/api/v1/`,
      })

      if (img_path === "") {
        mast.post('statuses', params, (err, data) => {
          if (err) reject(err);
          resolve(true);
        });
      } else {
        mast.post('media', { file: fs.createReadStream(img_path) }, (err, data) => {
          if (err) reject(err);
        })
        .then(resp => {
          img_id = resp.data.id;
          params["media_ids"] = [img_id];
          mast.post('statuses', params, (err, data) => {
            if (err) reject(err);
            resolve(true);
          });
        })
      }
    })
  }

  getAccessToken() {
    return this.accessToken;
  }

  getInstanceUrl() {
    return this.instanceUrl;
  }

  setInstanceUrl(instance_url) {
    if ( !instance_regexp.test(instance_url) ){
      console.error("Given instance URL has no valid syntax! Required form: \"foo.bar\"");
    }
    this.instanceUrl = instance_url;
  }

  setClientId(client_id) {
    this.clientId = client_id;
  }

  setClientSecret(client_secret) {
    this.clientSecret = client_secret;
  }

  setAccessToken(access_token) {
    this.accessToken = access_token;
  }

  callback(data, error) {
    if (error) {
      console.error(error);
    } else {
      console.log(data);
      return true;
    }
  }
}
module.exports = MastApi;
