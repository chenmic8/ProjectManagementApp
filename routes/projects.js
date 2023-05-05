var express = require("express");
var router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const State = require("../models/State");
const Subtask = require("../models/Subtask");
const axios = require("axios");
const { isLoggedIn } = require("../middleware/route-guard");
const { formatDates } = require("../lib/taskHelpers");

/*********************
 *
 *  get all projects
 *
 *********************/
router.get("/all-projects", isLoggedIn, (req, res) => {
  const user = req.session.user._id;
  //BACKEND/ROUTE LOGIC
  Project.find({ user: user })
    .populate("state")
    .populate("user")
    .then((projects) => {
      projects = formatDates(projects);
      res.render("projects.hbs", { projects });
    });
});
/*****************
 *
 *  project CRUD
 *
 *****************/
router.post("/create", (req, res) => {
  const newProject = req.body;

  if (req.body.githubURL) {
    const githubURL = req.body.githubURL;
    console.log("GITHUBURL: ", githubURL);
    const githubUser = new URL(githubURL).pathname.split("/")[1];
    const githubRepo = new URL(githubURL).pathname.split("/")[2];
    console.log("GITHUBURL user: ", githubUser);
    console.log("GITHUBURL repo: ", githubRepo);
    const github = {
      username: githubUser,
      repo: githubRepo,
      url: githubURL,
    };
    newProject.github = github;
    console.log("NEW PROJECT WITH ADDED GITHUB INFO", newProject);
  }
  const user = req.session.user._id;
  newProject.user = user;
  State.findOne({ name: "new" }).then((newState) => {
    newProject.state = newState._id;
    Project.create(newProject).then((createdProject) => {
      res.redirect("/projects/all-projects");
    });
  });
});
router.post("/edit/:projectId", (req, res) => {
  const projID = req.params.projectId;
  const updatedProject = req.body;
  let { title, user, state, githubURL } = updatedProject;
  const githubUser = new URL(githubURL).pathname.split("/")[1];
  const githubRepo = new URL(githubURL).pathname.split("/")[2];
  Project.findByIdAndUpdate(projID, {
    title,
    user,
    state,
    github: {
      username: githubUser,
      repo: githubRepo,
      url: githubURL,
    },
  }).then((updatedProject) => {
    res.redirect(`/tasks/all-tasks/${projID}`);
  });
});
router.post("/delete/:projectId", (req, res) => {
  const projectID = req.params.projectId;
  //get all tasks to delete all subtasks for each task
  Task.find({ project: projectID }).then((tasks) => {
    async function deleteSubtasksofTasksArray(arr) {
      for (i = 0; i < arr.length; i++) {
        await Subtask.deleteMany({ task: arr[i]._id });
      }
    }
    deleteSubtasksofTasksArray(tasks).then(() => {
      Task.deleteMany({ project: projectID }).then(() => {
        Project.findByIdAndDelete(projectID).then(() => {
          res.redirect(`/projects/all-projects`);
        });
      });
    });
  });
});

/* GET home page. */
// router.get("/", function (req, res, next) {
//   //get list of projects
//   const projects = [
//     {
//       id: 01,
//       title: "project 1",
//       state: "new",
//       order: 1,
//       description: "new test project 1",
//       dateCreated: "01/01/1999",
//     },
//     {
//       id: 02,
//       title: "project 2",
//       state: "new",
//       order: 2,
//       description: "new test project 2",
//       dateCreated: "02/02/1999",
//     },
//     {
//       id: 03,
//       title: "project 3",
//       state: "new",
//       order: 3,
//       description: "new test project 3",
//       dateCreated: "03/03/1999",
//     },
//     {
//       id: 04,
//       title: "project 4",
//       state: "new",
//       order: 4,
//       description: "new test project 4",
//       dateCreated: "04/04/1999",
//     },
//   ];

//   res.render("projects", { projects });
// });

// router.get("/:projectTitle", function (req, res, next) {
//   //get list of projects
//   const tasks = [
//     {
//       id: 01,
//       title: "task 1",
//       order: 1,
//       description: "new test task 1",
//       dateCreated: "01/01/1999",
//       estimatedTime: 1,
//       percentComplete: 0,
//       state: "new",
//       assignedTo: ["Michelle"],
//       project: req.params.projectTitle,
//     },
//     {
//       id: 02,
//       title: "task 2",
//       order: 2,
//       description: "new test task 2",
//       dateCreated: "02/02/1999",
//       estimatedTime: 2,
//       percentComplete: 0,
//       state: "new",
//       assignedTo: ["Michelle"],
//       project: req.params.projectTitle,
//     },
//     {
//       id: 03,
//       title: "task 3",
//       order: 3,
//       description: "new test task 3",
//       dateCreated: "03/03/1999",
//       estimatedTime: 3,
//       percentComplete: 0,
//       state: "new",
//       assignedTo: ["Michelle"],
//       project: req.params.projectTitle,
//     },
//     {
//       id: 04,
//       title: "task 4",
//       order: 4,
//       description: "new test task 4",
//       dateCreated: "04/04/1999",
//       estimatedTime: 4,
//       percentComplete: 0,
//       state: "new",
//       assignedTo: ["Michelle"],
//       project: req.params.projectTitle,
//     },
//   ];
//   console.log("project title: ", req.params.projectTitle);
//   res.render("tasks", {
//     data: { tasks: tasks, project: req.params.projectTitle },
//   });
// });

// router.post("/", (req, res) => {
//   let { description, assignedTo } = req.body;
//   console.log(description, assignedTo);
//   res.send("worked");
// });
// router.post("/edit", (req, res) => {
//   res.send("worked");
// });

module.exports = router;
