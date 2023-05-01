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
    .populate("user")
    .then((foundProject) => {
      const { _id, title, description, state, user } = foundProject;
      Task.find({ project: projID })
        .populate("state")
        .populate("user")
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
                user,
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
  const user = req.session.user._id;
  State.findOne({ name: "new" }).then((newState) => {
    Task.create({
      title,
      description,
      state: newState._id,
      project: projID,
      user,
    }).then((createdTask) => {
      res.redirect(`/tasks/all-tasks/${projID}`);
    });
  });
});
router.post("/edit/:taskId", (req, res, next) => {
  const taskID = req.params.taskId;
  const updatedTask = req.body;
  Task.findByIdAndUpdate(taskID, updatedTask).then((updatedTask) => {
    console.log("updated Task: ", updatedTask);
    res.redirect(`/subtasks/all-subtasks/${taskID}`);
  });
});

module.exports = router;
