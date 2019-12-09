var express = require("express");
var router = express.Router();
var fs = require("fs");

const DataBase_Path = "./database.json";

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/register/device/:token", function(req, res, next) {
  fs.readFile("./database.json", { encoding: "utf-8" }, (err, data) => {
    if (!err) {
      let parsed_data = JSON.parse(data);

      parsed_data.push(req.params.token);

      fs.writeFile("./database.json", JSON.stringify(parsed_data), () => {
        return res.status(200).json({
          err: null,
          msg: req.params.token,
          data: true
        });
      });
    } else {
      console.log(err);
      next();
    }
  });
});

module.exports = router;
