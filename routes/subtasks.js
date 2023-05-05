var express = require("express");
var router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Project = require("../models/Project");
const Task = require("../models/Task");
const State = require("../models/State");
const Subtask = require("../models/Subtask");
const taskHelpers = require("../lib/taskHelpers");
const formatDates = taskHelpers.formatDates;

/**
 * wrapper for addOtherStates that will always calculate the time remaining
 * @param {Array} doables
 * @param {*} states
 */
function addOtherStatesField(doables, states) {
  return taskHelpers.addOtherStatesField(doables, states, true);
}

/********************************
 *
 *  get all subtasks for a task
 *
 ********************************/
router.get("/all-subtasks/:taskId", (req, res) => {
  const taskID = req.params.taskId;
  const sortParam = req.query.sortParam;
  const filterParam = req.query.filterParam;
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
            foundTask = formatDates([foundTask], states)[0];
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
            if (!foundTask.totalEstimatedTime) foundTask.percentComplete = 0;
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
router.post("/create/:taskId", upload.single("subtaskPicture"), (req, res) => {
  let subtask = req.body;
  const taskID = req.params.taskId;
  const user = req.session.user._id;
  if (req.file) {
    const encoded = req.file.buffer.toString("base64");
    const imageType = req.file.mimetype;
    const image = `data:${imageType};charset=utf-8;base64, ${encoded}`;
    subtask.image = image;
  }
  if (!req.body.estimatedTime) subtask.estimatedTime = 1;
  subtask.percentComplete = 0;
  subtask.task = taskID;
  subtask.user = user;
  State.findOne({ name: "new" }).then((newState) => {
    subtask.state = newState._id;
    Subtask.create(subtask).then((createdSubtask) => {
      res.redirect(`/subtasks/all-subtasks/${taskID}`);
    });
  });
});

router.post("/edit/:subtaskId", upload.single("subtaskPicture"), (req, res) => {
  const subtaskID = req.params.subtaskId;
  let updatedSubtask = req.body;
  if (req.file) {
    const encoded = req.file.buffer.toString("base64");
    const imageType = req.file.mimetype;
    const image = `data:${imageType};charset=utf-8;base64, ${encoded}`;
    updatedSubtask.image = image;
  }
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
