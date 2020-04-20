// Add line numbers
var code = document.querySelectorAll(".comments");
code.forEach((item, i) => {
  item.innerHTML = i + '&nbsp;' + item.innerHTML;
});


$('#code').click(function(e) {

  var selection = window.getSelection();
  if (!selection || selection.rangeCount < 1) {
    return true
  };

  var parentnode = selection.getRangeAt(0).startContainer.parentNode.innerHTML;
  var anchorOffset = selection.anchorOffset;
  var range = selection.getRangeAt(0);
  var node = selection.anchorNode;
  var word_regexp = /^\w*$/;

  // Extend the range backward until it matches word beginning
  while ((range.startOffset > 0) && range.toString().match(word_regexp)) {
    range.setStart(node, (range.startOffset - 1));
  }
  // Restore the valid word match after overshooting
  if (!range.toString().match(word_regexp)) {
    range.setStart(node, range.startOffset + 1);
  }

  // Extend the range forward until it matches word ending
  while ((range.endOffset < node.length) && range.toString().match(word_regexp)) {
    range.setEnd(node, range.endOffset + 1);
  }
  // Restore the valid word match after overshooting
  if (!range.toString().match(word_regexp)) {
    range.setEnd(node, range.endOffset - 1);
  }

  var word = range.toString();

  // Add line of selected word to feedback box
  var feedbackbox = document.querySelector('#feedbackbox');
  var feedbackline = document.querySelector('#feedbackline');
  var characters = document.querySelector('#characters');
  feedbackbox.innerHTML = word;
  feedbackline.innerHTML = parentnode;
  characters.innerHTML = anchorOffset;
  var line = feedbackline.innerHTML[0]; // TODO: check for int

  // Store information temporally
  dict = {
    "word": word,
    "parentnode": parentnode,
    "anchorOffset": anchorOffset,
    "line": line
  };

  popUpFeedback(e)

});


function saveFeedback(input) {

  // Get feedback text
  var input = document.querySelector("#feedbackinput").value;
  dict["feedback"] = input;

  // Add saved info
  var paragraph = "<p>" + JSON.stringify(dict) + "</p>";
  document.querySelector('.savedfeedback').innerHTML += paragraph;

  // TODO: Store data in database
}


function popUpFeedback(e) {

  var feedbacktotal = document.querySelector('.feedback');
  feedbacktotal.style.display = 'block';

  // Remove old feedback
  var oldfeedbackcircle = document.querySelector('.circle-wrapper');
  var oldfeedback = document.querySelector('.feedback-input');
  if (oldfeedbackcircle)  {
    oldfeedbackcircle.remove();

    // TODO
    // oldfeedback.remove();
  }

  // Add circle to clicked location
  $('<div class="circle-wrapper">')
            .css({
                "left": e.pageX + 'px',
                "top": e.pageY + 'px'
            })
            .append($('<div class="circle"></div>'))
            .appendTo(document.body);

  // Input pop up
  $('<div class="feedback-input">').css({
            // "left": e.pageX + 'px',
            "top": e.pageY + 'px'
        })
        .append($('.feedback'))
        .appendTo(document.body)

}


// Attatch circle to closest word on resize
$(window).resize(function() {

  var selection = window.getSelection();

  // Check if there was a selection made
  if (!selection) {
    return true
  };

  // Get location of selected element
  var range = selection.getRangeAt(0).getBoundingClientRect();

  // TODO get middle in stead of left boundary
  xPage = range.x + 20;
  yPage = range.y + 5;

  // Let circle to be attachted to closest word
  $('.circle-wrapper').css({
    "left": xPage + 'px',
    "top": yPage + 'px'
  })


});
