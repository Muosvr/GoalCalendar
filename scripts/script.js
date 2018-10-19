// $(".sortable").sortable({
//   appendTo:document.body
// });



function run(){
  console.log("running");
  // $('.sortable').css({border: "3px solid red"});
  // $('.sortable').sortable();

  //add grag sorting. Source: https://stackoverflow.com/questions/44415228/list-sorting-with-html5-dragndrop-drop-above-or-below-depending-on-mouse
  var dragging = null;

  // console.log(document.getElementsByClassName("dragHandle"))

  // var dragHandle = document.getElementsByClassName("dragHandle")
  // dragHandle.addEventListener('click', function(e){
  //   console.log(e.target);
  // })

  var listItem = "<li draggable='true' class='sortable-bulk listItem'>"
                + "<input placeholder='task' class='task' type='text'></input>"
                +"<input placeholder='deadline' class='datepicker' type='date'></input>"
                + "<input placeholder='hours' class='duration' type='number'></input>"
                + "<button class='deleteBtn' action=delete()>Delete</button>"
                + "</li>"

  $("#addButton").click(function(){
    $("ul").append(listItem);
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
  });

}


function schedule_task(){
  var list = $(".listItem");
  var length = list.length;
  var availability = {
    "Mon": 0,
    "Tue": 0,
    "Wed": 0,
    "Thur": 0,
    "Fri": 0,
    "Sat": 0,
    "Sun": 0
  }

  for(i=0; i<7; i++){
    var id = $("td")[i].getElementsByTagName("Input")[0].id;
    var value = $("td")[i].getElementsByTagName("Input")[0].value;
    if (value != ""){
      availability[id] = parseInt(value);
    }

  }

  console.log(availability)

  for(i=0; i<length; i++){

  }
  console.log(list.length)
}
