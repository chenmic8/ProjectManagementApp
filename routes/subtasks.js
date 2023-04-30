var express = require("express");
var router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const State = require("../models/State");
const Subtask = require("../models/Subtask");
/********************************
 *
 *  get all subtasks for a task
 *
 ********************************/
router.get("/all-subtasks/:taskId", (req, res, next) => {
  const taskID = req.params.taskId;
  Task.findById(taskID)
    .populate("state")
    .populate("project")
    .then((foundTask) => {
      const { _id, title, description, state, project } = foundTask;
      Subtask.find({ task: taskID })
        .populate("state")
        .populate("task")
        .then((foundSubtasks) => {
          State.find().then((states) => {
            //to preselect status of task
            taskState = foundTask.state;
            otherStates = states.map((tempstate) => {
              if (!(tempstate.name === taskState.name)) {
                return tempstate;
              }
            });
            const subtasksPageObject = {
              subtasks: foundSubtasks,
              task: {
                title,
                _id,
                description,
                state,
                project,
                otherStates,
              },
            };
            console.log(subtasksPageObject);
            res.render("subtasks.hbs", subtasksPageObject);
          });
        });
    });
});
/*****************
 *
 *  subtask CRUD
 *
 *****************/
router.post("/create/:taskId", (req, res, next) => {
  const { title, description, estimatedTime, type } = req.body;
  const taskID = req.params.taskId;
  State.findOne({ name: "new" }).then((newState) => {
    Subtask.create({
      title,
      description,
      estimatedTime,
      percentComplete: 0,
      type,
      task: taskID,
      user: "644d9ac111997a23fd9e5339",
      state: newState._id,
    }).then((createdSubtask) => {
      res.redirect(`/subtasks/all-subtasks/${taskID}`);
    });
  });
});

module.exports = router;
