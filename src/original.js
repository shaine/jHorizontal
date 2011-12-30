/**************************************
 *
 *
 * Setup
 *
 *
 */

// The width of the area the left point of the scrollbar can move in
var scrollable_width = 0;
// The width of the inner scrolling content
var inner_width = 0;
// The width of the area the left point of the scrolling content can move in
var max_left = 0;

// After EVERYTHING has loaded,
// run some size calculations
$(window).load(function() {
  if($('.col.fixed').length) {
    var fixed = $('.col.fixed');
    
    $('#content').prepend('<div id="fixed_col"></div>');
    var col = $('#fixed_col');
    col.hide();
    
    col.css('width', fixed.css('width'));
    col.attr('class', $('.col.fixed').attr('class'))
    col.append(fixed.find('.col_inner'));
    col.prepend('<div id="fixed_bg"></div>');
    $('#fixed_bg').css('background-color', fixed.css('background-color'));
    
    $('#scrollbar_inner').css('left', $('.col.fixed').width() + 1 + 'px');
  }
  
  // Establish the width of the open scroll area
  scrollable_width = $('#scrollbar_inner').width() - $('#scrollbar').width();
  
  // Establish the scrolling content width
  $('#slider_inner').children().each(function() {
    inner_width += $(this).outerWidth(true);
  });
  
  // Calculate the scrollable area
  max_left = inner_width - $('#slider_outer').width();

  if(window.location.hash != "") {
    // scroll to section
    scrollToHash(window.location.hash);
  }
  
  $('a.disabled').live('click', function() {
    return false;
  });
  
  $('#scrollbar').show();
  
  $('.col.video a').each(function() {
    $(this).append('<img src="/images/play.png" alt="play" style="position: absolute; top: 130px; left: 279px;" class="play_button" />');
  });
  
  $('.col.video').each(function() {
    $(this).data('original-html', $(this).html());
  });
});

// Make up a reverse function
jQuery.fn.reverse = function() {
  return this.pushStack(this.get().reverse(), arguments);
};

// jQuery Random Filter
jQuery.jQueryRandom = 0;
jQuery.extend(jQuery.expr[":"],
{
  random: function(a, i, m, r) {
    if (i == 0) {
      jQuery.jQueryRandom = Math.floor(Math.random() * r.length);
    };
    return i == jQuery.jQueryRandom;
  }
});

// After the DOM has loaded
$(function() {
  // Add a click event for all '#blah' links
  $("a:[href^='#']").live('click', hashClick);
  
  /******************
   *
   * EVENT LISTENERS
   *
   */
  // Event listeners for iPad dragging
  if(!$.browser.msie) {
    $('#slider_inner')[0].addEventListener("touchstart", touchStart, false);
    $('#slider_inner')[0].addEventListener("touchmove", touchMove, false);
  }
  
  // Enable scrollable content on slider_outer
  hookEvent('slider_outer', 'mousewheel', MouseWheel);
  
  // Make the scrollbar draggable
  $('#scrollbar').draggable({
    axis: 'x',
    containment: 'parent',
    drag: scrollbarDrag
  });
  
});

function showRandomColumn() {
  var cols = $('.col_inner:hidden');
  var rand = Math.floor(Math.random() * cols.length);
  
  cols.eq(rand).fadeIn(500, showRandomColumn);
}

/**************************************
 *
 *
 * CONTENT MOVEMENT-RELATED FUNCTIONS
 *
 *
 */

/**
 * Master function to control every part of the movement
 * 
 * @param scrollto Integer representing what pixel position the inner frame is moving to
 */
function scrollThings(scrollto) {
  // Make sure we have a properly formatted scrollto
  // within our expected range
  if(scrollto < 0) {
    scrollto = 0;
  }
  else if(scrollto > max_left) {
    scrollto = max_left;
  }
  
  // Scroll the content
  $('#slider_outer').scrollLeft(scrollto);
  
  // Scroll the scrollbar
  scrollTheBar(scrollto);
}

/**
 * Controls the scrollbar position.
 * 
 * @param scrollto Integer representing what pixel position the inner frame is moving to
 */
function scrollTheBar(scrollto) {
  // Turn the pixel data into a percentage scrolled
  var percent = scrollto / max_left;
  
  // Figure out where the scrollbar left needs to be
  var scrollbar_left = Math.round(percent * scrollable_width);
  if(scrollbar_left < 0) {
    scrollbar_left = 0;
  }
  
  // Move the bar
  $('#scrollbar').css('left', scrollbar_left);
}

/**************************************
 *
 *
 * HASH-RELATED
 *
 *
 */

/**
 * Scroll to the given hash's section
 * 
 * @param hash JS URL hash string
 */
function scrollToHash(hash) {
  // Start off your mornings right with a clean hash
  hash = getSanitizedHash(hash);
  
  changeHash(hash);

  // Get the offset of the section
  var scrollto = getSectionX(getSectionByHash(hash));
  
  // If necessary, consider the offset of the left bar
  if($('#fixed_col').length) {
    scrollto -= $('#fixed_col').width();
  }
  
  // Go!
  scrollThings(scrollto);
}

/**
 * Change the URL hash
 * 
 * @param hash JS URL hash string
 */
function changeHash(hash) {
  // Start off your mornings right with a clean hash
  hash = getSanitizedHash(hash);
  window.location.hash = hash;
}

/**
 * Event listener for subnav clicks
 */
function hashClick() {
  var hash = $(this).attr('href');
  hash = hash.substr(hash.indexOf('#'));
  
  changeHash(hash);
  scrollToHash(hash);
}

/**************************************
 *
 *
 * GETTERS, SETTERS
 *
 *
 */

/**
 * Get the element's X position in the scrolling content
 * 
 * @param section jQuery element for the section
 */
function getSectionX(section) {
  if(section.position() === undefined) { return getCurrentX(); }
  return section.position().left;
}

/**
 * Get the current scroll position of the viewing area
 */
function getCurrentX() {
  return $('#slider_outer').scrollLeft();
}

/**
 * Gets the section for the hash.
 * 
 * @param hash JS URL hash string
 */
function getSectionByHash(hash) {
  // Start off your mornings right with a clean hash
  hash = getSanitizedHash(hash);
  
  return $('[id='+hash+']');
}

/**
 * Cleans up a JS URL hash
 * 
 * @param hash JS URL hash string
 */
function getSanitizedHash(hash) {
  return hash.replace(/_section$/, '').replace('#', '');
}

/**
 * Turn the scrollbar's % into the scrolling content's scroll px.
 * 
 * @param percent Float representing the percent the scrollbar has scrolled
 */
function getPXFromPercentage(percent) {
  return Math.round(percent * max_left);
}

/**
 * Gets the center of our viewport relative to the scrolling content.
 */
function getCurrentPosition() {
  var pos = getCurrentX();
  
  return pos + ($('#slider_outer').width());
}

/**
 * Gets the section our viewport point is over.
 */
function getCurrentSection() {
  var current = null;
  $('#slider_inner').children().each(function() {
    if($(this).position().left + $(this).outerWidth(true) > getCurrentPosition()) {
      current = $(this);
      return false;
    }
  });
  
  return current;
}

/**************************************
 *
 *
 * MOVEMENT RESPONDERS
 *
 *
 */

// Where drag movement starts
var startX = 0;
// Where the content is scrolled to
// at the beginning of a drag
var startPosX = 0;

/**
 * Set up the drag motion
 * 
 * @param event Drag Event
 */
function touchStart(event) {
  // Save where we started
  startX = event.targetTouches[0].pageX;
  // Save where the content is initially
  startPosX = getCurrentX();
}

/**
 * Handle the iPad drag motion
 * 
 * @param event Drag Event
 */
function touchMove(event) {
  // Don't do whatever you were about to do
  event.preventDefault();
  
  // Calculate the drag difference
  curX = event.targetTouches[0].pageX - startX;
  var scrollto = startPosX-curX;
  
  // Go!
  scrollThings(scrollto);
}

/**
 * Responds to the mouse wheel
 * 
 * @param e Event
 */
function MouseWheel(e) {
  // Setup stuff
  e = e ? e : window.event;
  var raw = e.detail ? e.detail : e.wheelDelta;
  var normal = e.detail ? e.detail * -1 : e.wheelDelta / 40;
  
  // Set to a comfortable speed
  normal = normal * -30;
  var scrollto = $('#slider_outer').scrollLeft() + normal;
  
  // Scroll!
  scrollThings(scrollto);

  // No one knows what this does
  return cancelEvent(e);
}

function scrollbarDrag() {
  var left = parseInt($('#scrollbar').css('left').replace('px', ''));
  var percent = left / scrollable_width;
  var scrollto = getPXFromPercentage(percent);
  
  scrollThings(scrollto);
}

/**************************************
 *
 *
 * SCROLLWHEEL EVENT HANDLING FRAMEWORK
 * (whatever you're looking for, it's
 * not in here. Do not modify.)
 *
 *
 */

/**
 * Hook event for scrollwheel events.
 * 
 * @param element ID of the element
 * @param eventName Name of the vent to hook
 * @param callback Function to call with the event
 */
function hookEvent(element, eventName, callback)
{
  if(typeof(element) == "string")
    element = document.getElementById(element);
  if(element == null)
    return;
  if(element.addEventListener)
  {
    if(eventName == 'mousewheel')
      element.addEventListener('DOMMouseScroll', callback, false);  
    element.addEventListener(eventName, callback, false);
  }
  else if(element.attachEvent)
    element.attachEvent("on" + eventName, callback);
}

/**
 * Unhook event for scrollwheel events.
 * 
 * @param element ID of the element
 * @param eventName Name of the vent to unhook
 * @param callback Function to call with the event
 */
function unhookEvent(element, eventName, callback)
{
  if(typeof(element) == "string")
    element = document.getElementById(element);
  if(element == null)
    return;
  if(element.removeEventListener)
  {
    if(eventName == 'mousewheel')
      element.removeEventListener('DOMMouseScroll', callback, false);  
    element.removeEventListener(eventName, callback, false);
  }
  else if(element.detachEvent)
    element.detachEvent("on" + eventName, callback);
}

/**
 * For the scrollwheel events.
 * 
 * @param e Event
 */
function cancelEvent(e)
{
  e = e ? e : window.event;
  if(e.stopPropagation)
    e.stopPropagation();
  if(e.preventDefault)
    e.preventDefault();
  e.cancelBubble = true;
  e.cancel = true;
  e.returnValue = false;
  return false;
}