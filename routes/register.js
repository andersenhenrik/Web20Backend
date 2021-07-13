var express = require("express");
const DbAccess = require("../src/db_access");
var Db = new DbAccess("userdb", "users");
const router = express.Router();
const Scrypt = require("scrypt-kdf");

class UsersHandler {
  /**
   * registers new Megaphon user
   *
   * @static
   * @param {*} req request in form email:email, pwd:password
   * @param {*} res response
   * @returns
   * @memberof UsersHandler
   */
  static async registerUser(req, res) {
    if (req.body.email == "" || req.body.pwd == "") {
      res.status(400).json({
        success: false,
        message: "Please enter email, password",
      });
      return;
    }

    //const hashedPW = await UsersHandler.hash(req.body.pwd);
    const keyBuf = await Scrypt.kdf(req.body.pwd, { logN: 15 });
    const hashedPW = keyBuf.toString("base64");
    const insertSuccess = await Db.insertUser(req.body.email, hashedPW);
    console.log(insertSuccess);
    if (!insertSuccess) {
      res.status(400).json({
        success: false,
        message: "User could not be registered",
      });
      return;
    }
    return res.json({
      success: true,
      message: `Added user to database`,
    });
  }
}

router.post("/", UsersHandler.registerUser);
module.exports = router;
