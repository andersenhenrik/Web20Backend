var steem = require("steem");
var express = require("express");
var router = express.Router();
var crypto = require("../src/encryption");
const middleware = require("../middleware");
const DbAccess = require("../src/db_access");
var Db = new DbAccess("userdb", "users");

class SteemHandler {
  /**
   * registers Megafon user for Steemit
   *
   * @static
   * @param {*} req request with username, masterpassword
   * @param {*} res response
   * @returns
   * @memberof SteemHandler
   */
  static async register(req, res) {
    steem.api.setOptions({ url: "https://api.steemit.com" });
    const account = await steem.api.getAccountsAsync([req.body.username]);
    if (!account) {
      res.json({
        success: false,
        message: "Steemit account with that name not found",
      });
      return;
    }
    const pubKey = account[0].posting.key_auths[0][0];/*  */
    //retrieve posting key from steemit
    const { posting } = steem.auth.getPrivateKeys(
      req.body.username,
      req.body.secret,
      ["posting"]
    );
    const isValid = steem.auth.wifIsValid(posting, pubKey);

    if (isValid) {
      res.json({
        success: true,
        message: "Authentification for steemit successful",
      });
      //save the posting key encrypted in db
      const postingCipher = crypto.encrypt(posting);
      const { userId } = req.decoded;
      const updated = await Db.updateSteemKey(userId, postingCipher);
      if (!updated) {
        res.json({
          success: false,
          message: "Steemit key not updated in Db",
        });
        return;
      }
      //save the username encrypted in db
      const usernameCipher = crypto.encrypt(req.body.username);

      const updatedName = await Db.updatesteemName(userId, usernameCipher);
      if (!updatedName) {
        res.json({
          success: false,
          message: "Steemit name not updated in Db",
        });
        return;
      }
    } else {
      res.sendStatus(403).json({
        success: false,
        message: "Invalid credentials for steemit",
      });
      return;
    }
  }

  /**
   * makes post for Steemit for user
   *
   * @static
   * @param {*} req request with post body, title, tags, optional: image
   * @param {*} res response
   * @returns
   * @memberof SteemHandler
   */
  static async post(req, result) {
    steem.api.setOptions({ url: "https://api.steemit.com" });
    const { userId } = req.decoded;
    const steeminfo = await Db.getSteemInfos(userId);
    if (!steeminfo) {
      res.json({
        success: false,
        message: "Steeminfo was not fetched from Db",
      });
      return;
    }
    const username = crypto.decrypt(steeminfo.name);
    const postingKey = crypto.decrypt(steeminfo.postingKey);

    const search = " ";
    const replaceWith = "-";

    const titleAsPermlink = req.body.title.toLowerCase().split(search).join(replaceWith);
    var imgString = "";
    if (req.body.imgUrl != "") {
      imgString = "![]" + "(" + req.body.imgUrl + ")";
    }

    const mainTag = req.body.tags[0];
    steem.broadcast.comment(
      postingKey,
      "",
      mainTag,
      username,
      
      titleAsPermlink,
      req.body.title,
      imgString + req.body.message,
      { tags: req.body.tags },
      (err, res) => {

        if (!err) {
          result.json({
            success: true,
            message: "Post for steemit  successful",
          });
        } else {
          result.json({
            success: false,
            message: "Post for steemit not successful",
          });
          return;
        }
      }
    );
  }
}
router.post("/register", middleware.checkToken, SteemHandler.register);
router.post("/post", middleware.checkToken, SteemHandler.post);

module.exports = router;
