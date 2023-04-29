var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  //get list of projects
  const projects = [
    {
      id: 01,
      title: "project 1",
      state: "new",
      order: 1,
      description: "new test project 1",
      dateCreated: "01/01/1999",
    },
    {
      id: 02,
      title: "project 2",
      state: "new",
      order: 2,
      description: "new test project 2",
      dateCreated: "02/02/1999",
    },
    {
      id: 03,
      title: "project 3",
      state: "new",
      order: 3,
      description: "new test project 3",
      dateCreated: "03/03/1999",
    },
    {
      id: 04,
      title: "project 4",
      state: "new",
      order: 4,
      description: "new test project 4",
      dateCreated: "04/04/1999",
    },
  ];

  res.render("projects", { projects });
});
router.get("/:projectTitle", function (req, res, next) {
  //get list of projects
  const tasks = [
    {
      id: 01,
      title: "task 1",
      order: 1,
      description: "new test task 1",
      dateCreated: "01/01/1999",
      estimatedTime: 1,
      percentComplete: 0,
      state: "new",
      assignedTo: ["Michelle"],
      project: req.params.projectTitle,
    },
    {
      id: 02,
      title: "task 2",
      order: 2,
      description: "new test task 2",
      dateCreated: "02/02/1999",
      estimatedTime: 2,
      percentComplete: 0,
      state: "new",
      assignedTo: ["Michelle"],
      project: req.params.projectTitle,
    },
    {
      id: 03,
      title: "task 3",
      order: 3,
      description: "new test task 3",
      dateCreated: "03/03/1999",
      estimatedTime: 3,
      percentComplete: 0,
      state: "new",
      assignedTo: ["Michelle"],
      project: req.params.projectTitle,
    },
    {
      id: 04,
      title: "task 4",
      order: 4,
      description: "new test task 4",
      dateCreated: "04/04/1999",
      estimatedTime: 4,
      percentComplete: 0,
      state: "new",
      assignedTo: ["Michelle"],
      project: req.params.projectTitle,
    },
  ];
  console.log("project title: ", req.params.projectTitle);
  res.render("tasks", {
    data: { tasks: tasks, project: req.params.projectTitle },
  });
});

router.get("/create", (req, res) => {});

router.post("/", (req, res) => {
  let { description, assignedTo } = req.body;
  console.log(description, assignedTo);
  res.send("worked");
});
router.post("/edit", (req, res) => {
  res.send("worked");
});

module.exports = router;
