// Import class via:
// const DbAcces = require('path/to/this/file/db_access.js');
// var Db = new DbAccess(dbName, collection);
// where dbName is 'userdb' and collection is 'users' for Megafon Backend

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require("dotenv").config();

const params = { useNewUrlParser: true, useUnifiedTopology: true };
// Uncomment this url for remote usage (rolename and pw/ full Link given on Discord)
const url = process.env.DB_URL;
// Uncomment this url for usage on server with local mongo database
//const url = 'mongodb://127.0.0.1:27017'
const emailRegexp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/;
const instanceRegexp = /^\w+(\.\w+)+$/;

class DbAccess {
  constructor(dbName, collectionName) {
    this.dbName = dbName;
    this.collection = collectionName;
  }


  insertUser(
    email,
    pwd,
    mastUrl = "",
    mastToken = "",
    steemKey = "",
    steemName = "",
    twitterOAuthToken = "",
    twitterAccessTokenKey = "",
    twitterAccessTokenKeySecret = ""
  ) {
    return new Promise((resolve, reject) => {
      var email_lower = email.toLowerCase()
      console.log(email_lower);
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;
        // Check if given email is valid
        if (!emailRegexp.test(email_lower)) {
          console.error(`Email <${email}> is not valid!`);
          resolve(false);
        }
        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let userObj = {
          email: email_lower,
          password: pwd,
          mastUrl: mastUrl,
          mastToken: mastToken,
          steemKey: steemKey,
          steemName: steemName,
          twitterOAuthToken: twitterOAuthToken,
          twitterAccessTokenKey: twitterAccessTokenKey,
          twitterAccessTokenKeySecret: twitterAccessTokenKeySecret
        };

        // Check if user with email adress already exists
        let query = { email: email_lower };
        coll.findOne(query, (err, res) => {
          if (err) throw err;
          if (res) {
            console.error(`Email <${email}> already in usage!`);
            resolve(false);
            return;
          }
        });
        coll.insertOne(userObj, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(true);
          return;
        });
      });
    });
  } // end insertUser() definition

  doesUserExist(email) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { email: email.toLowerCase() };
        coll.findOne(query, (err, res) => {
          if (err) throw err;
          if (res) {
            client.close();
            resolve(res._id);
          } else {
            client.close()
            console.error(`No existing user with email <${email}>!`);
            resolve(false);
          }
        });
      });
    });
  } // end doesUserExist() definition

  doesUserIdExist(userId) {
    return new Promise( (resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { '_id' : ObjectId(userId) }
        coll.findOne(query, (err, res) => {
          if (err) throw (err);
          if (res) {
            client.close();
            resolve(true);
          } else {
            client.close()
            console.error(`No existing user with id <${userId}>!`);
            resolve(false);
          }
        })
      })
    })
  } // end doesUserIdExist() definition

  updateEmail(userId, email) {
    return new Promise((resolve, reject) => {
      var email_lower = email.toLowerCase();
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;
        // Check if given email is valid
        if (!emailRegexp.test(email_lower)) {
          console.error(`Email <${email}> has no valid form!`);
          resolve(false);
          return;
        }

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };
        let newValue = { $set: { email: email_lower } };
        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateEmail() definition

  /**
   * handles login post request, returning valid login token
   *
   * @static
   * @param {*} req request
   * @param {*} res response
   * @returns
   * @memberof LoginHandler
   */

  updatePasssword(userId, password) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };
        let newValue = { $set: { password: password } };
        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updatePasssword() definition

  /**
   * handles login post request, returning valid login token
   *
   * @static
   * @param {*} req request
   * @param {*} res response
   * @returns
   * @memberof LoginHandler
   */

   updateMastToken(userId, accessToken) {
     return new Promise( (resolve, reject) => {
       MongoClient.connect(url, params, (err, client) => {
         if (err) throw err;

         let db = client.db(this.dbName);
         let coll = db.collection(this.collection);
         let query = { '_id' : ObjectId(userId) }
         let newValue = { $set: { 'mastToken' : accessToken} }
         coll.updateOne(query, newValue, (err, res) => {
           if (err) throw err;
           client.close()
           resolve(res.modifiedCount == 1 ? true : false);
         })
       })
     })
   } // end updateMastToken() definition

   updateMastId(userId, mastId) {
     return new Promise( (resolve, reject) => {
       MongoClient.connect(url, params, (err, client) => {
         if (err) throw err;

         let db = client.db(this.dbName);
         let coll = db.collection(this.collection);
         let query = { '_id' : ObjectId(userId) }
         let newValue = { $set: { 'mastId' : mastId } }
         coll.updateOne(query, newValue, (err, res) => {
           if (err) throw err;
           client.close()
           resolve(res.modifiedCount == 1 ? true : false);
         })
       })
     })
   } // end updateMastId() definition

   updateMastSecret(userId, mastSecret) {
     return new Promise( (resolve, reject) => {
       MongoClient.connect(url, params, (err, client) => {
         if (err) throw err;

         let db = client.db(this.dbName);
         let coll = db.collection(this.collection);
         let query = { '_id' : ObjectId(userId) }
         let newValue = { $set: { 'mastSecret' : mastSecret } }
         coll.updateOne(query, newValue, (err, res) => {
           if (err) throw err;
           client.close()
           resolve(res.modifiedCount == 1 ? true : false);
         })
       })
     })
   } // end updateMastSecret() definition


   updateTwitterOAuthToken(userId, twitterOAuthToken) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);

        let query = { '_id' : ObjectId(userId) }
        let newValue = { $set: { 'twitterOAuthToken' : twitterOAuthToken } }

        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateTwitterOAuthToken() definition

  updateTwitterAccessTokenKey(twitterOAuthToken, twitterAccessTokenKey) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);

        let query = { 'twitterOAuthToken' : twitterOAuthToken }
        let newValue = { $set: { 'twitterAccessTokenKey' : twitterAccessTokenKey } }

        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateTwitterAccessTokenKey() definition

  updateTwitterAccessTokenKeySecret(twitterOAuthToken, twitterAccessTokenKeySecret) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);

        let query = { 'twitterOAuthToken' : twitterOAuthToken }
        let newValue = { $set: { 'twitterAccessTokenKeySecret' : twitterAccessTokenKeySecret } }

        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateTwitterAccessTokenKeySecret() definition

  /**
   * handles login post request, returning valid login token
   *
   * @static
   * @param {*} req request
   * @param {*} res response
   * @returns
   * @memberof LoginHandler
   */

  updateSteemKey(userId, steemKey) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };
        let newValue = { $set: { steemKey: steemKey } };
        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateSteemKey() definition


  updateSteemName(userId, steemName) {
    return new Promise( (resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };
        let newValue = { $set: { steemName: steemName } };
        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateSteemName() definition

  updateMastUrl(userId, instanceUrl) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;
        // Check if given Url is a valid instance Url
        // Due to encryption this must be done before saving in database!
        /*if (!instanceRegexp.test(instanceUrl)) {
          throw new Error("Instance Url is not valid!");
        }*/
        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };
        let newValue = { $set: { mastUrl: instanceUrl } };
        coll.updateOne(query, newValue, (err, res) => {
          if (err) throw err;
          client.close();
          resolve(res.modifiedCount == 1 ? true : false);
        });
      });
    });
  } // end updateMastUrl() definition

  /**
   * handles login post request, returning valid login token
   *
   * @static
   * @param {*} req request
   * @param {*} res response
   * @returns
   * @memberof LoginHandler
   */
  getPasswordFromDatabase(email) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { email: email.toLowerCase() };

        coll.findOne(query, (err, res) => {
          if (err) throw err;
          if (res) {
            let pw = {
              password: res.password,
            };
            client.close();
            resolve(pw);
          }
        });
      });
    });
  }
  /**
   * handles login post request, returning valid login token
   *
   * @static
   * @param {*} req request
   * @param {*} res response
   * @returns
   * @memberof LoginHandler
   */
   getMastodonInfos(userId) {
      return new Promise( (resolve, reject) => {

        MongoClient.connect(url, params, (err, client) => {
          if (err) throw err;

          let db = client.db(this.dbName);
          let coll = db.collection(this.collection);
          let query = { '_id' : ObjectId(userId)};

          coll.findOne(query, (err, res) => {
            if (err) throw err;
            if (res) {
              let mastInfos = {
                'instance':res.mastUrl,
                'accessToken':res.mastToken,
                'mastId':res.mastId,
                'mastSecret':res.mastSecret
              };
              client.close();
              resolve(mastInfos);
            }
          })
        })
      })
    } // end getMastodonInfos() definition

  getTwitterInfos(userId) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };

        coll.findOne(query, (err, res) => {
          if (err) throw err;
          if (res) {
            let twitterInfos = {
              'oauthToken' : res.oauthToken,
              'accessTokenKey': res.twitterAccessTokenKey,
              'accessTokenKeySecret': res.twitterAccessTokenKeySecret
            };
            client.close();
            resolve(twitterInfos);
          }
        });
      });
    });
  } // end getTwitterInfos() definition

  getSteemInfos(userId) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, params, (err, client) => {
        if (err) throw err;

        let db = client.db(this.dbName);
        let coll = db.collection(this.collection);
        let query = { _id: ObjectId(userId) };

        coll.findOne(query, (err, res) => {
          if (err) throw err;
          if (res) {
            let steemInfos = {
              name: res.steemName,
              postingKey: res.steemKey,
            };
            client.close();
            resolve(steemInfos);
          }
        });
      });
    });
  } // end getSteemInfos() definition
} // end class definition

module.exports = DbAccess;
