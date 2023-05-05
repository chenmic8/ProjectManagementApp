var express = require("express");
var router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const State = require("../models/State");
const Subtask = require("../models/Subtask");
const axios = require("axios");
const { addOtherStatesField, formatDates } = require("../lib/taskHelpers");

/********************************
 *
 *  get all tasks for a project
 *
 ********************************/
router.get("/all-tasks/:projectId", (req, res) => {
  const projID = req.params.projectId;
  Project.findById(projID)
    .populate("state")
    .populate("user")
    .then((foundProject) => {
      foundProject = formatDates([foundProject])[0];
      Task.find({ project: projID })
        .populate("state")
        .populate("user")
        .then((foundTasks) => {
          async function getTimeData() {
            let deepcopyTasks = JSON.parse(JSON.stringify(foundTasks));
            for (i = 0; i < foundTasks.length; i++) {
              await Subtask.find(
                { task: foundTasks[i]._id },
                "percentComplete estimatedTime"
              ).then((subtasks) => {
                function getTotalTimeRemaining(subtasks) {
                  return subtasks.reduce(
                    (a, b) =>
                      a +
                      Math.round(
                        10 * b.estimatedTime * (1 - b.percentComplete / 100)
                      ) /
                        10,
                    0
                  );
                }
                /**
                 * cool comment
                 * @param {Array<Subtask>} subtasks
                 * @returns
                 */
                function getTotalEstimatedTime(subtasks) {
                  return subtasks.reduce((a, b) => a + b.estimatedTime, 0);
                }
                function getPercentComplete(
                  totalEstimatedTime,
                  totalTimeRemaining
                ) {
                  return Math.round(
                    ((totalEstimatedTime - totalTimeRemaining) /
                      totalEstimatedTime) *
                      100
                  );
                }
                deepcopyTasks[i].totalEstimatedTime =
                  getTotalEstimatedTime(subtasks);
                deepcopyTasks[i].totalTimeRemaining =
                  getTotalTimeRemaining(subtasks);
                if (!deepcopyTasks[i].totalEstimatedTime) {
                  deepcopyTasks[i].percentComplete = 0;
                } else {
                  deepcopyTasks[i].percentComplete = getPercentComplete(
                    deepcopyTasks[i].totalEstimatedTime,
                    deepcopyTasks[i].totalTimeRemaining
                  );
                }
                foundTasks = deepcopyTasks;
              });
            }
          }
          getTimeData().then(() => {
            foundTasks = formatDates(foundTasks);
            State.find().then((states) => {
              foundProject = addOtherStatesField([foundProject], states)[0];
              if (foundProject.github) {
                axios
                  .get(
                    `https://api.github.com/repos/${foundProject.github.username}/${foundProject.github.repo}/commits`,
                    {
                      headers: {
                        Authorization:
                          "Bearer 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",
                      },
                    }
                  )
                  .then((result) => {
                    const latestCommitDate = new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "numeric",
                    }).format(new Date(result.data[0].commit.committer.date));
                    foundProject.latestCommitDate = latestCommitDate;
                    //views page object
                    const tasksPageObject = {
                      tasks: foundTasks,
                      project: foundProject,
                    };
                    res.render("tasks.hbs", tasksPageObject);
                  });
              } else {
                const tasksPageObject = {
                  tasks: foundTasks,
                  project: foundProject,
                };
                res.render("tasks.hbs", tasksPageObject);
              }
            });
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
router.post("/create/:projectId", (req, res) => {
  const { title, description } = req.body;
  const projID = req.params.projectId;
  const user = req.session.user._id;
  if (!title) res.redirect(`/tasks/all-tasks/${projID}`);
  else {
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
  }
});
router.post("/edit/:taskId", (req, res) => {
  const taskID = req.params.taskId;
  const updatedTask = req.body;
  Task.findByIdAndUpdate(taskID, updatedTask).then((updatedTask) => {
    res.redirect(`/subtasks/all-subtasks/${taskID}`);
  });
});

router.post("/delete/:taskId", (req, res) => {
  const taskID = req.params.taskId;

  Subtask.deleteMany({ task: taskID }).then((deletedSubtasks) => {
    Task.findByIdAndDelete(taskID).then((deletedTask) => {
      res.redirect(`/tasks/all-tasks/${deletedTask.project}`);
    });
  });
});


module.exports = router;
