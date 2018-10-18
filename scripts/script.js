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
