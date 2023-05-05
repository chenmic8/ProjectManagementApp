//add other states function
function addOtherStatesField(doables, states, calculateTimeRemaining = false) {
  let filteredStates = (state) => {
    return states.filter((element) => {
      return element.name !== state;
    });
  };
  let doablesDeepcopy = JSON.parse(JSON.stringify(doables));
  return doablesDeepcopy.map((item) => {
    item.otherStates = filteredStates(item.state.name);
    //also add other field for time remaining
    if (calculateTimeRemaining) {
      item.timeRemaining =
        Math.round(10 * item.estimatedTime * (1 - item.percentComplete / 100)) /
        10;
    }
    return item;
  });
}
//format dates function: createdAt, updatedAt => format: "Month 01"
function formatDates(doables) {
  let doablesDeepcopy = JSON.parse(JSON.stringify(doables));
  return doablesDeepcopy.map((item) => {
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
}

module.exports = {
  formatDates,
  addOtherStatesField,
};
