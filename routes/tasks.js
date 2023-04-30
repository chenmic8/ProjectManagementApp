var express = require("express");
var router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const State = require("../models/State");
/********************************
 *
 *  get all tasks for a project
 *
 ********************************/
router.get("/all-tasks/:projectId", (req, res, next) => {
  const projID = req.params.projectId;
  Project.findById(projID)
    .populate("state")
    .then((foundProject) => {
      const { _id, title, description, state } = foundProject;
      Task.find({ project: projID })
        .populate("state")
        .then((foundTasks) => {
          State.find().then((states) => {
            //to preselect status of project
            projectState = foundProject.state;
            otherStates = states.map((state) => {
              if (!(state.name === projectState.name)) {
                return state;
              }
            });
            const tasksPageObject = {
              tasks: foundTasks,
              project: {
                title,
                _id,
                description,
                state,
                otherStates,
              },
            };
            res.render("tasks.hbs", tasksPageObject);
          });
        });
    });
});
/**************
 *
 *  task CRUD
 *
 **************/
//create task based off of projectId
router.post("/create/:projectId", (req, res, next) => {
  const { title, description } = req.body;
  const projID = req.params.projectId;
  Task.create({
    title,
    description,
    state: "644d97c6a5eedd5fc3be1ffb",
    project: projID,
    user: "644d9ac111997a23fd9e5339",
  }).then((createdTask) => {
    res.redirect(`/tasks/all-tasks/${projID}`);
  });
});
router.post("/edit/:taskId", (req, res, next) => {
    const taskID = req.params.taskId;
    const updatedTask = req.body;
    Task.findByIdAndUpdate(taskID, updatedTask).then((updatedTask) => {
      console.log("updated Task: ", updatedTask);
      res.redirect(`/tasks/all-tasks/${taskID}`);
    });
  });
  

module.exports = router;
