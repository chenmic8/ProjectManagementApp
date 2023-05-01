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
  const sortParam = req.query.sortParam;
  const filterParam = req.query.filterParam;
  Task.findById(taskID)
    .populate("state")
    .populate("project")
    .populate("user")
    .then((foundTask) => {
      const { _id, title, description, state, project, user } = foundTask;
      Subtask.find({ task: taskID })
        .populate("state")
        .populate("task")
        .populate("user")
        .then((foundSubtasks) => {
          State.find().then((states) => {
            //function that returns the other states given a state name
            let filteredStates = (state) => {
              return states.filter((element) => {
                return element.name !== state;
              });
            };
            //add otherStates to each subtask object
            let deepcopySubtasks = JSON.parse(JSON.stringify(foundSubtasks));
            let subtasksWithOtherStates = deepcopySubtasks.map((subtask) => {
              subtask.otherStates = filteredStates(subtask.state.name);
              subtask.boolean = true;
              return subtask;
            });
            //to preselect status of task
            taskState = foundTask.state;
            otherStates = states.map((tempstate) => {
              if (!(tempstate.name === taskState.name)) {
                return tempstate;
              }
            });
            //sort/filter subtasks
            if (sortParam || filterParam) {
              //sort
              if (sortParam === "statusAscending") {
                subtasksWithOtherStates = subtasksWithOtherStates.sort(
                  (a, b) => {
                    return a.state.value - b.state.value;
                  }
                );
              } else if (sortParam === "statusDescending") {
                subtasksWithOtherStates = subtasksWithOtherStates.sort(
                  (a, b) => {
                    return b.state.value - a.state.value;
                  }
                );
              } else if (sortParam === "percentAscending") {
                subtasksWithOtherStates = subtasksWithOtherStates.sort(
                  (a, b) => {
                    return a.percentComplete - b.percentComplete;
                  }
                );
              } else if (sortParam === "percentDescending") {
                subtasksWithOtherStates = subtasksWithOtherStates.sort(
                  (a, b) => {
                    return b.percentComplete - a.percentComplete;
                  }
                );
              }

              //filter
              function filter(array, parameter) {
                return array.filter(
                  (subtask) => subtask.state.name === parameter
                );
              }
              if (filterParam) {
                subtasksWithOtherStates = filter(
                  subtasksWithOtherStates,
                  filterParam
                );
              }
            }
            const subtasksPageObject = {
              subtasks: subtasksWithOtherStates,
              task: {
                title,
                _id,
                description,
                state,
                project,
                user,
                otherStates,
              },
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
router.post("/create/:taskId", (req, res, next) => {
  const { title, description, estimatedTime, type } = req.body;
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

router.post("/edit/:subtaskId", (req, res, next) => {
  const subtaskID = req.params.subtaskId;
  const updatedSubtask = req.body;
  Subtask.findByIdAndUpdate(subtaskID, updatedSubtask).then(
    (updatedSubtask) => {
      res.redirect(`/subtasks/all-subtasks/${updatedSubtask.task}`);
    }
  );
});

//sortsubtasks
// router.get("/sort/:sortParameter", (req,res,next)=>{
//   const sortParam = req.params.sortParameter;

// })

module.exports = router;
