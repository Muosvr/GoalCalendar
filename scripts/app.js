// $(".sortable").sortable({
//   appendTo:document.body
// });
list_template =
  "<li draggable='true' class='sortable-bulk listItem'>" +
  "<input placeholder='task' class='task task_attribute' type='text'></input>" +
  "<input placeholder='deadline' class='datepicker task_attribute' type='date'></input>" +
  "<input placeholder='hours' class='duration task_attribute' type='number' step='0.25'></input>" +
  "<button class='deleteBtn task_attribute' action=delete()>Delete</button>" +
  "</li>";
//run the app
function run() {
  console.log("running");
  display_days();
  show_localStorage();
  display_tasks();
  make_list_sortable();
  auto_update_and_save();
}

function get_timestamps() {
  var length = eventList.length;
  var timestamps = {};
  for (i = 0; i < length; i++) {
    if (
      eventList[i].start.dateTime != undefined &&
      eventList[i].end.dateTime != undefined
    ) {
      var start = new Date(eventList[i].start.dateTime);
      var end = new Date(eventList[i].end.dateTime);
      var duration = ((end - start) / 36e5) * 1.0;
      var overnight_tolerance = 3;
      if (
        start.toLocaleDateString() == end.toLocaleDateString() ||
        duration < overnight_tolerance
      ) {
        //   var event_name = eventList[i].summary
        //   // console.log(i, event_name, duration);
        if (timestamps[start.toLocaleDateString()] == undefined) {
          timestamps[start.toLocaleDateString()] = [];
        }
        timestamps[start.toLocaleDateString()].push({ start: start });
        timestamps[start.toLocaleDateString()].push({ end: end });
        timestamps[start.toLocaleDateString()].sort(function(a, b) {
          return Object.values(a)[0] - Object.values(b)[0];
        });
      }
    }
  }
  return timestamps;
}

function count_availablity() {
  var timestamps = get_timestamps();
  var dates = Object.keys(timestamps);
  var availability = {};
  var daily_total_hours = 13;
  var current_time = new Date();
  var start_time = new Date();
  start_time.setHours(9, 0, 0); //hour, min, sec

  for (i = 0; i < dates.length; i++) {
    var events = timestamps[dates[i]];
    var start_count = 0;
    var busy_hours = 0.0;
    var free_time = 0;
    // var inside_event = false;
    for (j = 0; j < events.length; j++) {
      if (events[j].start != undefined && start_count == 0) {
        var start = events[j].start;
        start_count = 1;
      } else if (events[j].start != undefined && start_count > 0) {
        start_count += 1;
      } else if (events[j].end != undefined && start_count > 1) {
        start_count -= 1;
      } else if (events[j].end != undefined && start_count == 1) {
        var end = events[j].end;
        busy_hours += ((end - start) / 36e5) * 1.0;
        start_count = 0;
      }
      // console.log(dates[i], busy_hours);
    }
    if (dates[i] == current_time.toLocaleDateString()) {
      var time_elapsed = ((current_time - start_time) / 36e5) * 1.0;
      free_time = daily_total_hours - time_elapsed - busy_hours;
      // console.log("Time elapsed:", time_elapsed);
      // console.log("Free time:", free_time);
    } else {
      free_time = daily_total_hours - busy_hours;
    }

    if (free_time < 0) {
      free_time = 0;
    }
    availability[dates[i]] = free_time;
  }
  return availability;
}

function update_availability() {
  var availability = count_availablity();
  var inputs = $(".schedule input");
  var days = $(".schedule th");
  for (i = 0; i < inputs.length; i++) {
    var key = days[i].id;
    if (availability[key] != undefined) {
      $(inputs[i]).val(availability[key]);
    } else {
      console.log("Unable to find availability for:", key);
    }
  }
}

function get_days() {
  var day_count = 7;
  var datetime = [];
  for (i = 0; i < day_count; i++) {
    date = new Date();
    date.setDate(date.getDate() + i);
    datetime.push(date);
  }
  return datetime;
}

function display_days() {
  var days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  var datetimes = get_days();
  var length = datetimes.length;
  for (i = 0; i < length; i++) {
    var day_of_week = days[datetimes[i].getDay()];
    var day_of_month = datetimes[i].getDate();
    $("#schedule_head").append(
      "<th id=" +
        datetimes[i].toLocaleDateString() +
        ">" +
        day_of_week +
        " " +
        day_of_month +
        "</th>"
    );
  }
}

function display_localStorage_availability() {
  if (localStorage.availability != undefined) {
    var availability = JSON.parse(localStorage.availability);
    schedule_th = $(".schedule th");
    schedule_input = $(".schedule input");
    for (i = 0; i < schedule_th.length; i++) {
      key = schedule_th[i].innerHTML;
      value = availability[key];
      $(schedule_input[i]).val(value);
    }
  }
}

function display_localStorage_tasks() {
  if (localStorage.tasks != undefined) {
    var list = localStorage.tasks.split("\n");
  }

  if (list) {
    for (i = 0; i < list.length; i++) {
      var task_attribute = list[i].split(",");
      var attribute_count = task_attribute.length;
      // console.log("Task attribute: "+ task_attribute);
      $("ul").append(list_template);
      $("ul li:last .task").val(task_attribute[0]);
      $("ul li:last .deadline").val(task_attribute[1]);
      $("ul li:last .duration").val(parseFloat(task_attribute[2]));
      $("ul li:last .deleteBtn").click(function() {
        list = $(this)[0].parentNode;
        // console.log(list);
        list.remove();
      });
    }
  }

  return list;
}

function show_localStorage() {
  display_localStorage_availability();
  display_localStorage_tasks();
}

//activate button functions and saves
function auto_update_and_save() {
  $("input").keyup(function() {
    display_tasks();
    save();
  });
  $("button").click(function() {
    display_tasks();
    save();
  });
  $("input").click(function() {
    display_tasks();
    save();
  });
}

function add_task() {
  $("ul").append(list_template);
  $("ul li:last .deleteBtn").click(function() {
    list = $(this)[0].parentNode;
    // console.log(list);
    list.remove();
  });
}

//add drag sorting. Source: https://stackoverflow.com/questions/44415228/list-sorting-with-html5-dragndrop-drop-above-or-below-depending-on-mouse
function make_list_sortable() {
  var dragging = null;
  document.addEventListener("dragstart", function(event) {
    dragging = event.target;
    event.dataTransfer.setData("text/html", dragging);
  });

  document.addEventListener("dragover", function(event) {
    event.preventDefault();
    //window.requestAnimationFrame(function(){
    var bounding = event.target.getBoundingClientRect();
    var offset = bounding.y + bounding.height / 2;
    if (event.clientY - offset > 0) {
      event.target.style["border-bottom"] = "solid 6px grey";
      event.target.style["border-top"] = "";
    } else {
      event.target.style["border-top"] = "solid 6px grey";
      event.target.style["border-bottom"] = "";
    }
    //});
  });

  document.addEventListener("dragleave", function(event) {
    event.target.style["border-bottom"] = "";
    event.target.style["border-top"] = "";
  });

  document.addEventListener("drop", function(event) {
    event.preventDefault();
    if (event.target.style["border-bottom"] !== "") {
      event.target.style["border-bottom"] = "";
      event.target.parentNode.insertBefore(dragging, event.target.nextSibling);
    } else {
      event.target.style["border-top"] = "";
      event.target.parentNode.insertBefore(dragging, event.target);
    }
    display_tasks();
    save();
  });
}

function get_availability() {
  var availability = {};

  for (i = 0; i < 7; i++) {
    var key = $(".schedule th")[i].innerHTML;
    var value = $(".schedule input")[i].value;
    if (value == "") {
      value = 0;
    }
    availability[key] = parseFloat(value);
  }
  return availability;
}

class Task {
  constructor() {
    this.description = "";
    this.duration = 0;
    this.scheduled_duration = 0;
    this.deadline = "";
    this.scheduled_dates = [];
  }
}

function get_tasks() {
  var jList = $(".listItem");
  var length = jList.length;
  var tasks = [];

  for (i = 0; i < length; i++) {
    var task = new Task();
    task.description = jList[i].getElementsByClassName("task")[0].value;
    task.duration = jList[i].getElementsByClassName("duration")[0].value;
    task.deadline = jList[i].getElementsByClassName("datepicker")[0].value;
    tasks.push(task);
  }
  return tasks;
}

function schedule_tasks() {
  var availability = get_availability();
  var days = 7;
  var tasks = get_tasks();
  var task_count = tasks.length;
  var week = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thur",
    5: "Fri",
    6: "Sat"
  };
  var future_datetimes = get_days();

  var task_index = 0;
  for (i = 0; i < days; i++) {
    var day_date =
      week[future_datetimes[i].getDay()] + " " + future_datetimes[i].getDate();
    var hours = parseFloat(availability[day_date]);
    var remaining_hours = hours;
    var min_duration = 1;
    for (j = task_index; j < task_count; j++) {
      if (tasks[j].duration && tasks[j].duration != 0) {
        var duration = parseFloat(
          tasks[j].duration - tasks[j].scheduled_duration
        );
        if (remaining_hours >= duration && duration > 0) {
          remaining_hours -= duration;
          tasks[j].scheduled_dates.push(day_date);
          tasks[j].scheduled_duration += duration;
          // console.log(week[i], "Task: "+tasks[j].description, "remaining_duration: "+duration, "remaining hours: "+remaining_hours, "scheduled_duration: "+tasks[j].scheduled_duration)
        } else {
          if (remaining_hours >= 1 && duration > 0) {
            tasks[j].scheduled_dates.push(day_date);
            tasks[j].scheduled_duration += remaining_hours;
            remaining_hours = 0;
            // console.log(week[i], "Task: "+tasks[j].description, "remaining_duration: "+duration, "remaining hours: "+remaining_hours, "scheduled_duration: "+tasks[j].scheduled_duration)
          }
          task_index = j;
          break;
        }
      }
    }
  }
  return tasks;
}

function save() {
  store_tasks();
  store_availability();
  console.log("saved");
}

function store_tasks() {
  tasks = get_tasks();
  var length = tasks.length;
  var str = "";
  var task_attribute = ["description", "deadline", "duration"];
  for (i = 0; i < length; i++) {
    str += tasks[i]["description"] + ", ";
    str += tasks[i]["deadline"] + ", ";
    str += tasks[i]["duration"];
    if (i < length - 1) {
      str += "\n";
    }
  }
  localStorage.tasks = str;
}

function store_availability() {
  var availability = get_availability();
  localStorage.availability = JSON.stringify(availability);
}

function display_tasks() {
  $(".scheduled_dates").remove();
  var tasks = schedule_tasks();
  var jList = $(".listItem");
  var list_count = jList.length;
  // console.log(tasks);
  for (i = 0; i < list_count; i++) {
    dates = tasks[i].scheduled_dates;
    // console.log("dates: ", dates);
    for (j = 0; j < dates.length; j++) {
      $(jList[i]).append(
        "<div class='scheduled_dates' style='display:inline-block; margin-left:10px'>" +
          dates[j] +
          "</div>"
      );
    }
  }
}
