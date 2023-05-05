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
    const githubUser = new URL(githubURL).pathname.split("/")[1];
    const githubRepo = new URL(githubURL).pathname.split("/")[2];
    const github = {
      username: githubUser,
      repo: githubRepo,
      url: githubURL,
    };
    newProject.github = github;
  }
  const user = req.session.user._id;
  newProject.user = user;
  if (!req.body.title) res.redirect("/projects/all-projects");
  else {
    State.findOne({ name: "new" }).then((newState) => {
      newProject.state = newState._id;
      Project.create(newProject).then((createdProject) => {
        res.redirect("/projects/all-projects");
      });
    });
  }
});
router.post("/edit/:projectId", (req, res) => {
  const projID = req.params.projectId;
  const updatedProject = req.body;
  if (req.body.githubURL) {
    const githubURL = req.body.githubURL;
    const githubUser = new URL(githubURL).pathname.split("/")[1];
    const githubRepo = new URL(githubURL).pathname.split("/")[2];
    const github = {
      username: githubUser,
      repo: githubRepo,
      url: githubURL,
    };
    updatedProject.github = github;
  }
  Project.findByIdAndUpdate(projID, updatedProject).then((updatedProject) => {
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


module.exports = router;
