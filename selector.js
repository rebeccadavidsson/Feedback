// global variable to save selections
// TODO: store in database
savedselections = [];
id = 0;

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
  var saveNode = range.startContainer;

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
    "id" : id,
    "word": word,
    "selection": selection,
    "savenode": range.startContainer,
    "startOffset": range.startOffset,  // where the range starts
    "endOffset": range.endOffset,      // where the range ends
    "nodeData": saveNode.data,         // the actual selected text
    "nodeHTML": saveNode.parentElement.innerHTML,
    "nodeTagName": saveNode.parentElement.tagName,
  };
;
  // TODO: store in database
  popUpFeedback(e, range)

});


function saveFeedback() {

  // Get feedback text
  var input = document.querySelector("#feedbackinput").value;
  dict["feedback"] = input;

  // Store selection
  savedselections.push({
    "id":   dict["id"],
    "total": dict
  });

  // Store location of this feedback
  var feedbackcircle = $('.circle-wrapper');
  var highlights = $('.highlight');

  // Change class + store ids
  feedbackcircle.removeClass("circle-wrapper");
  feedbackcircle.addClass("savedfeedback");
  feedbackcircle.attr('id', "savedfeedback" + dict["id"])
  highlights.removeClass("highlight");
  highlights.addClass("savedhighlight");
  highlights.attr('id', "savedhighlight" + dict["id"])

  // TODO: Store data in database
  id += 1

  // Build new range
  var range = buildRange(dict["startOffset"],
                    dict["endOffset"],
                    dict["nodeData"],
                    dict["nodeHTML"],
                    dict["nodeTagName"])

  var range = range.getBoundingClientRect()

  // TODO get middle in stead of left boundary
  var xPage = range.x + 20;
  var yPage = range.y + 5;

  // Make new element with saved feedback
  $('<div class="finalfeedback">')
            .css({
                // "left": xPage + 'px',
                "top": yPage + 'px'
            })
            .append(input)
            .appendTo(document.body);

    // Add highlighted div
    $('<div class="highlight"></div>').css({
          "x": xPage + 'px',
          "y": yPage + 'px',
          'width': range.width + 'px',
          'height': range.height + 'px',
          'top': range.top + 'px',
          'right': range.right + 'px',
          'bottom': range.bottom + 'px',
          'left': range.left + 'px'
        })
        .appendTo(document.body);

}


function popUpFeedback(e, range) {

  var feedbacktotal = document.querySelector('.feedback');
  feedbacktotal.style.display = 'grid';

  // Remove old feedback
  var oldfeedbackcircle = document.querySelector('.circle-wrapper');

  if (oldfeedbackcircle)  {
    oldfeedbackcircle.remove();
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
            "top": e.pageY + 'px'
        })
        .append($('.feedback'))
        .appendTo(document.body)

  // Add highlighted div
  $('<div class="highlight"></div>').css({
        "x": range.x + 'px',
        "y": range.y + 'px',
        'width': range.width + 'px',
        'height': range.height + 'px',
        'top': range.top + 'px',
        'right': range.right + 'px',
        'bottom': range.bottom + 'px',
        'left': range.left + 'px'
      })
      .appendTo(document.body);


}

function buildRange(startOffset, endOffset, nodeData, nodeHTML, nodeTagName){

    var cDoc = document.getElementById("code");
    var tagList = cDoc.getElementsByTagName(nodeTagName);

    // find the parent element with the same innerHTML
    for (var i = 0; i < tagList.length; i++) {
        if (tagList[i].innerHTML == nodeHTML) {
            var foundEle = tagList[i];
        }
    }

    // find the node within the element by comparing node data
    var nodeList = foundEle.childNodes;
    for (var i = 0; i < nodeList.length; i++) {
        if (nodeList[i].data == nodeData) {
            var foundNode = nodeList[i];
        }
    }

    // create the range
    var range = document.createRange();
    range.setStart(foundNode, startOffset);
    range.setEnd(foundNode, endOffset);
    return range;
}


// Attatch circle to closest word on resize
$(window).resize(function() {

  savedselections.forEach((item, i) => {

    // Build new range
    var range = buildRange(item["total"]["startOffset"],
                      item["total"]["endOffset"],
                      item["total"]["nodeData"],
                      item["total"]["nodeHTML"],
                      item["total"]["nodeTagName"])

    var rangeBounded = range.getBoundingClientRect()

    // TODO get middle in stead of left boundary
    var xPage = rangeBounded.x + 20;
    var yPage = rangeBounded.y + 5;

    // Let circle to be attachted to closest word
    $('#savedfeedback' + item["id"]).css({
      "left": xPage + 'px',
      "top": yPage + 'px'
    });

    // Change position of highlighted div
    $('#savedhighlight' + item["id"]).css({
          "x":      rangeBounded.x + 'px',
          "y":      rangeBounded.y + 'px',
          'width':  rangeBounded.width + 'px',
          'height': rangeBounded.height + 'px',
          'top':    rangeBounded.top + 'px',
          'right':  rangeBounded.right + 'px',
          'bottom': rangeBounded.bottom + 'px',
          'left':   rangeBounded.left + 'px'
        });

  });

  // Do the same for the current selection
  var selection = window.getSelection();

  // Check if there was a selection made
  if (!selection) {
    return true
  };

  var range = selection.getRangeAt(0).getBoundingClientRect();

  // TODO get middle in stead of left boundary
  var xPage = range.x + 20;
  var yPage = range.y + 5;

  // Let circle to be attachted to closest word
  $('.circle-wrapper').css({
    "left": xPage + 'px',
    "top": yPage + 'px'
  })

  // Add highlighted div
  $('.highlight').css({
      "x": range.x + 'px',
      "y": range.y + 'px',
      'width': range.width + 'px',
      'height': range.height + 'px',
      'top': range.top + 'px',
      'right': range.right + 'px',
      'bottom': range.bottom + 'px',
      'left': range.left + 'px'
    });

});


// TODO: function to remove saved feedback
$('div.highlight').click(function(e) {
  e.remove();
})
