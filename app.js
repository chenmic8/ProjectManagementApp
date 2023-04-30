var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("hbs");
var mongoose = require("mongoose");
mongoose.set("strictQuery", false);

var projectsRouter = require("./routes/projects");
var usersRouter = require("./routes/users");
var tasksRouter = require("./routes/tasks");
var subtasksRouter = require("./routes/subtasks");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use('/', indexRouter);
app.use("/users", usersRouter);
app.use("/projects", projectsRouter);
app.use("/tasks", tasksRouter);
app.use("/subtasks", subtasksRouter);

app.get("/", (req, res) => {
  res.render("index", { title: "hello world" });
});

hbs.registerPartials(__dirname + "/views/partials");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
mongoose
  .connect(process.env.MONGODB_URI)
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => console.error("Error connecting to mongo: ", err));

module.exports = app;
