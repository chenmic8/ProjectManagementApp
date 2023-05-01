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
            let filteredStates = (state) => {
              console.log("state: ", state);
              return states.filter((element) => {
                return element.name !== state;
              });
            };

            let deepcopySubtasks = JSON.parse(JSON.stringify(foundSubtasks));

            let subtasksWithOtherStates = deepcopySubtasks.map(
              (subtask, i, arr) => {
                subtask.otherStates = filteredStates(subtask.state.name);
                subtask.boolean = true;
                console.log("SUBTASK THAT SHOULD HAVE OTHER STATES: ", arr[i]);
                return subtask;
              }
            );
            // let foundWithOtherStates = foundSubtasks.map((task) => {
            //   //     task.otherStates = filteredStates(task.state.name)
            //   return {
            //     ...task,
            //     ["otherStates"]: filteredStates(task.state.name),
            //   };
            //   //return Object.assign({}, task, {otherStates: filteredStates(task.state.name)})
            // });

            // let foundWithOtherStates = foundSubtasks.map((task) => {
            //   //     task.otherStates = filteredStates(task.state.name)
            //   return Object.assign({}, task, {
            //     _doc.otherStates: filteredStates(task.state.name),
            //   });
            // });
            console.log("TRY WITH OTHER MAP", subtasksWithOtherStates);

            //FOREACH METHOD TO MUTATE SUBTASKS
            // foundSubtasks.forEach((subtask, i, arr) => {
            //   subtask.otherStates = filteredStates(subtask.state.name);
            //   // arr[i].otherStates = filteredStates(subtask.state.name);
            //   console.log(
            //     "checking filtered states function: ",
            //     filteredStates(subtask.state.name)
            //   );
            //   console.log("check subtasks to see if it is mutating: ", subtask);
            //   console.log("check if array is adding otherstates", arr[i]);
            // });

            //to preselect status of task
            taskState = foundTask.state;
            otherStates = states.map((tempstate) => {
              if (!(tempstate.name === taskState.name)) {
                return tempstate;
              }
              // foundSubtasks.forEach((subtask, i, arr)=>{
              //   taskState = foundTask.state;
              //   otherStates = states.map((tempstate) => {
              //     if (!(tempstate.name === taskState.name)) {
              //       return tempstate;
              //     }
              // })
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
            console.log("Foundsubtasks", foundSubtasks);
            // console.log("subtasks page object: ", subtasksPageObject);
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
// router.get("/edit", (req, res, next) => {
//   // const subtaskID = req.params.subtaskId;
//   // Subtask.findById(subtaskID).then((foundSubtask) => {

//   // });
//   res.locals.test = "test!!!!!!!";
//   res.redirect("back");
// });
router.post("/edit/:subtaskId", (req, res, next) => {
  const subtaskID = req.params.subtaskId;
  const updatedSubtask = req.body;
  Subtask.findByIdAndUpdate(subtaskID, updatedSubtask).then(
    (updatedSubtask) => {
      console.log("updated subask: ", updatedSubtask);
      res.redirect(`/subtasks/all-subtasks/${updatedSubtask.task}`);
    }
  );
});

module.exports = router;
