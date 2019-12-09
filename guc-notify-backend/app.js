var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var Mockaroo = require("mockaroo");

var Pushy = require("pushy");
var pushyAPI = new Pushy(
  "9d292d662c552c7045de02f6c15f84cd39d81bb087759c392464443c5a54fa89"
);

var cron = require("node-cron");

var fs = require("fs");

var indexRouter = require("./routes/index");

var client = new Mockaroo.Client({
  apiKey: "33e41200"
});

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

cron.schedule("* */1 * * *", () => {
  client
    .generate({
      count: 10,
      format: "json",
      schema: "Courses_lvl_Report"
    })
    .then(function(records) {
      var courses = [];

      for (var i = 0; i < records.length; i++) {
        if (records[i].course_lvl == 3) {
          courses.push({
            course_code: records[i].course_code,
            course_lvl: records[i].course_lvl
          });
        }
      }

      var to = [];

      if (courses.length != 0) {
        console.log(courses);

        try {
          let devices = JSON.parse(
            fs.readFileSync("./database.json").toString()
          );

          for (var i = 0; i < devices.length; i++) {
            to.push(devices[i]);
          }

          if (to.length != 0) {
            for (var i = 0; i < courses.length; i++) {
              var data = {
                title: courses[i].course_code,
                message: `You Have Attendance Level: ${courses[i].course_lvl}`
              };

              pushyAPI.sendPushNotification(data, to, {}, function(err, id) {
                if (err) {
                  console.log("Fatal Error", err);
                } else {
                  console.log("Push sent successfully! (ID: " + id + ")");
                }
              });
            }
          }
        } catch (err) {
          console.log("Fatal Error", err);
        }
      }
    });
});

module.exports = app;
