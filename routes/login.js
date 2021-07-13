const express = require("express");
const jwt = require("jsonwebtoken");
const DbAccess = require("../src/db_access");
const router = express.Router();
var Db = new DbAccess("userdb", "users");
const Scrypt = require("scrypt-kdf");
require("dotenv").config;
/**
 * handler for /login route
 */
class LoginHandler {
  /**
   * handles login post request, returning valid login token
   *
   * @static
   * @param {*} req request in form email: email, pwd: password
   * @param {*} res response
   * @returns
   * @memberof LoginHandler
   */
  static async login(req, res) {
    const { email, pwd } = req.body;
    if (!(email && pwd)) {
      res.status(400).json({
        success: false,
        message: "Please enter email, password",
      });
      return;
    }
    const userIdFromDb = await Db.doesUserExist(email);
    if (!userIdFromDb) {
      res.status(403).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }
    const pwFromDb = await Db.getPasswordFromDatabase(email);
    const keyBuf = Buffer.from(pwFromDb.password, "base64");
    const correctPW = await Scrypt.verify(keyBuf, pwd);
    if (!correctPW) {
      res.status(403).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }
    const secret = process.env.SECRET;
    const token = jwt.sign({userId : userIdFromDb}, secret, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      message: "Authentification successful",
      token,
    });
  }
}

/* POST Login */
router.post("/", LoginHandler.login);

module.exports = router;
