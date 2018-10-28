// $(".sortable").sortable({
//   appendTo:document.body
// });
list_template="<li draggable='true' class='sortable-bulk listItem'>"
              + "<input placeholder='task' class='task task_attribute' type='text'></input>"
              +"<input placeholder='deadline' class='datepicker task_attribute' type='date'></input>"
              + "<input placeholder='hours' class='duration task_attribute' type='number' step='0.25'></input>"
              + "<button class='deleteBtn task_attribute' action=delete()>Delete</button>"
              + "</li>";

function display_localStorage_availability(){
  if(localStorage.availability != undefined){
    var hours = localStorage.availability.split(",");
  }
  weekdays = $(".schedule");
  for (i=0; i<weekdays.length; i++){
    $(weekdays[i]).val(parseFloat(hours[i]));
  }
}

function display_localStorage_tasks(){
  if (localStorage.tasks != undefined){
    var list = localStorage.tasks.split("\n")
  }

  for(i=0; i<list.length; i++){
    var task_attribute = list[i].split(",");
    var attribute_count = task_attribute.length;
    console.log("Task attribute: "+ task_attribute);
    $("ul").append(list_template);
    $("ul li:last .task").val(task_attribute[0]);
    $("ul li:last .deadline").val(task_attribute[1]);
    $("ul li:last .duration").val(parseFloat(task_attribute[2]));
    $("ul li:last .deleteBtn").click(function(){
      list = $(this)[0].parentNode;
      console.log(list);
      list.remove();
    });
  }
  return list
}

function show_localStorage(){
  display_localStorage_availability();
  display_localStorage_tasks();
}

function run(){
  console.log("running");
  show_localStorage();
  display_tasks();
  // $('.sortable').css({border: "3px solid red"});
  // $('.sortable').sortable();

  //add grag sorting. Source: https://stackoverflow.com/questions/44415228/list-sorting-with-html5-dragndrop-drop-above-or-below-depending-on-mouse
  var dragging = null;

  // console.log(document.getElementsByClassName("dragHandle"))

  // var dragHandle = document.getElementsByClassName("dragHandle")
  // dragHandle.addEventListener('click', function(e){
  //   console.log(e.target);
  // })


  $("#addButton").click(function(){
    $("ul").append(list_template);
    $("ul li:last .deleteBtn").click(function(){
      list = $(this)[0].parentNode;
      console.log(list);
      list.remove();
    })
  })



  document.addEventListener('dragstart', function(event) {
  		dragging = event.target;
      event.dataTransfer.setData('text/html', dragging);
  });

  document.addEventListener('dragover', function(event) {
      event.preventDefault();
      //window.requestAnimationFrame(function(){
      	var bounding = event.target.getBoundingClientRect()
        var offset = bounding.y + (bounding.height/2);
        if ( event.clientY - offset > 0 ) {
        	event.target.style['border-bottom'] = 'solid 6px grey';
          event.target.style['border-top'] = '';
        } else {
          event.target.style['border-top'] = 'solid 6px grey';
          event.target.style['border-bottom'] = '';
        }
      //});
  });

  document.addEventListener('dragleave', function(event) {
      event.target.style['border-bottom'] = '';
      event.target.style['border-top'] = '';
  });

  document.addEventListener('drop', function(event) {
      event.preventDefault();
      if ( event.target.style['border-bottom'] !== '' ) {
        event.target.style['border-bottom'] = '';
        event.target.parentNode.insertBefore(dragging, event.target.nextSibling);
      } else {
        event.target.style['border-top'] = '';
        event.target.parentNode.insertBefore(dragging, event.target);
      }
      display_tasks();
      save();
  });

  $("input").keyup(function(){
    display_tasks();
    save();
  });
  $("button").click(function(){
    display_tasks();
    save();
  })
  $("input").click(function(){
    display_tasks();
    save();
  })

}


function get_availability(){
  var availability = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
  }

  for(i=0; i<7; i++){
    // var id = $("td")[i].getElementsByTagName("Input")[0].id;
    var value = $("td")[i].getElementsByTagName("Input")[0].value;
    if (value != ""){
      availability[i] = parseFloat(value);
    }

  }
return availability
}

class Task {
  constructor(){
    this.description = "";
    this.duration = 0;
    this.scheduled_duration = 0;
    this.deadline = "";
    this.scheduled_dates = [];
  }
}

function get_tasks(){
  var jList = $(".listItem");
  var length = jList.length;
  var tasks = [];

  for (i = 0; i<length; i++){
    var task = new Task;
    task.description = jList[i].getElementsByClassName("task")[0].value;
    task.duration = jList[i].getElementsByClassName("duration")[0].value;
    task.deadline = jList[i].getElementsByClassName("datepicker")[0].value;
    tasks.push(task);
  }
  return tasks;
}

function schedule_tasks(){
  var availability = get_availability()
  var days = 7
  var tasks = get_tasks()
  var task_count = tasks.length
  var week = {
    0: "Mon",
    1: "Tue",
    2: "Wed",
    3: "Thur",
    4: "Fri",
    5: "Sat",
    6: "Sun"
  }

  var task_index = 0;
  for(i=0; i< days; i++){
    var hours = parseFloat(availability[i]);
    var remaining_hours = hours;
    var min_duration = 1;
      for(j=task_index; j<task_count; j++){
        var duration = parseFloat(tasks[j].duration - tasks[j].scheduled_duration);
        if (remaining_hours >= duration && duration > 0){
          remaining_hours -= duration;
          tasks[j].scheduled_dates.push(week[i]);
          tasks[j].scheduled_duration += duration;
          console.log(week[i], "Task: "+tasks[j].description, "remaining_duration: "+duration, "remaining hours: "+remaining_hours, "scheduled_duration: "+tasks[j].scheduled_duration)
        }else{
          if (remaining_hours >= 1 && duration > 0){
            tasks[j].scheduled_dates.push(week[i]);
            tasks[j].scheduled_duration += remaining_hours;
            remaining_hours = 0;
            console.log(week[i], "Task: "+tasks[j].description, "remaining_duration: "+duration, "remaining hours: "+remaining_hours, "scheduled_duration: "+tasks[j].scheduled_duration)
          }
          task_index = j;
          break;
        }
      }
  }
  return tasks;
}

function save(){
  store_tasks();
  store_availability();
  console.log("saved")
}

function store_tasks(){
  tasks = get_tasks();
  var length = tasks.length;
  var str = "";
  var task_attribute = ["description", "deadline", "duration"];
  for(i=0; i<length; i++){
    str += tasks[i]["description"] + ", ";
    str += tasks[i]["deadline"] + ", ";
    str += tasks[i]["duration"];
    if(i < length-1){
     str += "\n";
    }
  }
  localStorage.tasks = str
}

function store_availability(){
  var availability = get_availability();
  var days_in_week = 7;
  var temp_arr = [];
  var str = "";
  for(i=0; i<days_in_week; i++){
    temp_arr.push(availability[i]);
  }
  str = temp_arr.join(",");
  localStorage.availability = str;
}

function display_tasks(){
  $(".scheduled_dates").remove();
  var tasks = schedule_tasks();
  var jList = $(".listItem");
  var list_count = jList.length;
  console.log(tasks);
  for(i=0; i<list_count; i++){
    dates = tasks[i].scheduled_dates;
    // console.log("dates: ", dates);
    for (j=0; j<dates.length; j++){
      $(jList[i]).append("<div class='scheduled_dates' style='display:inline-block; margin-left:10px'>" + dates[j] + "</div>");

    }
  }
}
