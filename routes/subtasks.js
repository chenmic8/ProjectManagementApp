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
router.get("/all-subtasks/:taskId", (req, res) => {
  const taskID = req.params.taskId;
  const sortParam = req.query.sortParam;
  const filterParam = req.query.filterParam;
  //DEFINE FUNCTIONS
  //format dates function: createdAt, updatedAt => format: "Month 01"
  function formatDates(arr) {
    let deepcopyArr = JSON.parse(JSON.stringify(arr));
    arr = deepcopyArr.map((item) => {
      let dateCreated = new Date(item.createdAt);
      let dateUpdated = new Date(item.updatedAt);
      item.createdAt = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
      }).format(dateCreated);
      item.updatedAt = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
      }).format(dateUpdated);
      return item;
    });
    return arr;
  }
  //add other states function
  function addOtherStatesField(arr, states) {
    let filteredStates = (state) => {
      return states.filter((element) => {
        return element.name !== state;
      });
    };
    let deepcopyArr = JSON.parse(JSON.stringify(arr));
    arr = deepcopyArr.map((item) => {
      item.otherStates = filteredStates(item.state.name);
      //also add other field for time remaining
      item.timeRemaining =
        Math.round(10 * item.estimatedTime * (1 - item.percentComplete / 100)) /
        10;
      return item;
    });
    return arr;
  }
  //BACKEND/ROUTE LOGIC
  Task.findById(taskID)
    .populate("state")
    .populate("project")
    .populate("user")
    .then((foundTask) => {
      Subtask.find({ task: taskID })
        .populate("state")
        .populate("task")
        .populate("user")
        .then((foundSubtasks) => {
          State.find().then((states) => {
            foundSubtasks = addOtherStatesField(foundSubtasks, states);
            foundTask = addOtherStatesField([foundTask], states)[0];
            foundTask.totalSubtasks = foundSubtasks.length;
            foundSubtasks = formatDates(foundSubtasks);
            foundTask.totalTimeRemaining = foundSubtasks.reduce(
              (a, b) => a + b.timeRemaining,
              0
            );
            foundTask.totalEstimatedTime = foundSubtasks.reduce(
              (a, b) => a + b.estimatedTime,
              0
            );
            foundTask.percentComplete = Math.round(
              ((foundTask.totalEstimatedTime - foundTask.totalTimeRemaining) /
                foundTask.totalEstimatedTime) *
                100
            );
            //sort/filter subtasks
            if (sortParam || filterParam) {
              //sort
              if (sortParam === "statusAscending") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return a.state.value - b.state.value;
                });
              } else if (sortParam === "statusDescending") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return b.state.value - a.state.value;
                });
              } else if (sortParam === "percentAscending") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return a.percentComplete - b.percentComplete;
                });
              } else if (sortParam === "percentDescending") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return b.percentComplete - a.percentComplete;
                });
              } else if (sortParam === "dateUpdated") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return a.updatedAt.localeCompare(b.updatedAt);
                });
              } else if (sortParam === "timeRemaining") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return a.timeRemaining - b.timeRemaining;
                });
              } else if (sortParam === "estimatedTime") {
                foundSubtasks = foundSubtasks.sort((a, b) => {
                  return a.estimatedTime - b.estimatedTime;
                });
              }
              //filter
              function filter(array, parameter) {
                return array.filter(
                  (subtask) => subtask.state.name === parameter
                );
              }
              if (filterParam) {
                foundSubtasks = filter(foundSubtasks, filterParam);
              }
            }

            //views page object
            const subtasksPageObject = {
              subtasks: foundSubtasks,
              task: foundTask,
            };
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
router.post("/create/:taskId", (req, res) => {
  let { title, description, estimatedTime, type } = req.body;
  if (!estimatedTime) estimatedTime = 1;
  const taskID = req.params.taskId;
  const user = req.session.user._id;
  State.findOne({ name: "new" }).then((newState) => {
    Subtask.create({
      title,
      description,
      estimatedTime,
      percentComplete: 0,
      type,
      task: taskID,
      user,
      state: newState._id,
    }).then((createdSubtask) => {
      res.redirect(`/subtasks/all-subtasks/${taskID}`);
    });
  });
});

router.post("/edit/:subtaskId", (req, res) => {
  const subtaskID = req.params.subtaskId;
  const updatedSubtask = req.body;
  const { percentComplete } = updatedSubtask;
  State.findOne({ name: "ongoing" }).then((ongoingState) => {
    if (percentComplete > 0 && percentComplete < 100) {
      updatedSubtask.state = ongoingState._id;
    }
    Subtask.findByIdAndUpdate(subtaskID, updatedSubtask).then(
      (updatedSubtask) => {
        res.redirect(`/subtasks/all-subtasks/${updatedSubtask.task}`);
      }
    );
  });
});

router.post("/delete/:subtaskId", (req, res) => {
  const subtaskID = req.params.subtaskId;
  Subtask.findByIdAndDelete(subtaskID).then((deletedSubtask) => {
    res.redirect(`/subtasks/all-subtasks/${deletedSubtask.task}`);
  });
});

module.exports = router;
