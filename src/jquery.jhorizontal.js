/*!
 * jHorizontal v.0.0.1
 *
 * Copyright 2012, Shaine Hatch in cooperation with Digital Trike
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.touch-punch.js
 */
;(function($, doc, win) {
  "use strict";

  var name = 'jHorizontal';

  function jHorizontal(el, opts) {
    // Init our elements of interest
    this.$el = $(el); // The original slider element
    this.$inner = $(null); // The slider inner element
    this.$scrollbar = $(null); // The scrollbar element
    this.$scrollbar_outer = $(null); // The scrollbar container element

    this.defaults = {
      scrollbar: null,
      change_hash: true,
      watch_hash: true
    };

    // let's use our name variable here as well for our meta options
    var meta = this.$el.data(name + '-opts');
    this.opts = $.extend(this.defaults, opts, meta);

    // Internal vars
    this.scrollable_width = 0; // The width of the area the left point of the scrollbar can move in
    this.inner_width = 0; // The width of the inner scrolling content
    this.max_left = 0; // The width of the area the left point of the scrolling content can move in

    this.$el.data(name, this);

    this.init();
  }

  jHorizontal.prototype.init = function() {
    // Setup internal HTML elements
    this.$el.wrapInner('<div class="' + name + '_slider_inner" />');
    this.$inner = this.$el.find('.' + name + '_slider_inner');
    this.$scrollbar = $(this.opts.scrollbar);
    // If we have a scrollbar, find its outer element
    if(this.$scrollbar.length) {
      this.$scrollbar.wrap('<div />');
      this.$scrollbar_outer = this.$scrollbar.parent();
    }

    // Setup classes for our els
    this.$el.addClass(name + '_slider');
    this.$scrollbar.addClass(name + '_scrollbar');
    this.$scrollbar_outer.addClass(name + '_scrollbar_outer');

    // After EVERYTHING has loaded,
    // run some size calculations
    // Likely won't work if Window.load hasn't fired yet.

    // Establish the width of the open scroll area
    this.scrollable_width = this.$scrollbar.width() - this.$scrollbar_outer.width();

    // Establish the scrolling content width
    this.$inner.children().each(function() {
      this.inner_width += $(this).outerWidth(true);
    });

    // Calculate the scrollable area
    this.max_left = this.inner_width - this.$el.width();

    if(window.location.hash != "") {
      // scroll to section
      scrollToHash(window.location.hash);
    }

    // Make the scrollbar draggable
    this.$scrollbar.draggable({
      axis: 'x',
      containment: 'parent',
      drag: scrollbarDrag
    });

    //#scrollbar display block
    //Draggable scrollbar requires jQuery UI
  };

  jHorizontal.prototype.destroy = function() {
    this.$el.off('.' + name);
    this.$el.find('*').off('.' + name);

    this.$el.removeData(name);
    this.$el = null;
  };

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
  jHorizontal.prototype.scrollTo = function(scrollto) {
    // Make sure we have a properly formatted scrollto
    // within our expected range
    if(scrollto < 0) {
      scrollto = 0;
    }
    else if(scrollto > max_left) {
      scrollto = max_left;
    }

    // Scroll the content
    this.$el.scrollLeft(scrollto);

    // Scroll the scrollbar
    scrollTheBar(scrollto);

    return this;
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
    scrollTo(scrollto);
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
    scrollTo(scrollto);
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
    scrollTo(scrollto);

    // No one knows what this does
    return cancelEvent(e);
  }

  function scrollbarDrag() {
    var left = parseInt($('#scrollbar').css('left').replace('px', ''));
    var percent = left / scrollable_width;
    var scrollto = getPXFromPercentage(percent);

    scrollTo(scrollto);
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

  $.fn.jHorizontal = function(opts) {
    return this.each(function() {
      new jHorizontal(this, opts);
    });
  };
})(jQuery, document, window);

/*!
 * jQuery UI Touch Punch 0.1.0
 *
 * Copyright 2010, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function(c){c.support.touch=typeof Touch==="object";if(!c.support.touch){return;}var f=c.ui.mouse.prototype,g=f._mouseInit,a=f._mouseDown,e=f._mouseUp,b={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup"};function d(h){var i=h.originalEvent.changedTouches[0];return c.extend(h,{type:b[h.type],which:1,pageX:i.pageX,pageY:i.pageY,screenX:i.screenX,screenY:i.screenY,clientX:i.clientX,clientY:i.clientY});}f._mouseInit=function(){var h=this;h.element.bind("touchstart."+h.widgetName,function(i){return h._mouseDown(d(i));});g.call(h);};f._mouseDown=function(j){var h=this,i=a.call(h,j);h._touchMoveDelegate=function(k){return h._mouseMove(d(k));};h._touchEndDelegate=function(k){return h._mouseUp(d(k));};c(document).bind("touchmove."+h.widgetName,h._touchMoveDelegate).bind("touchend."+h.widgetName,h._touchEndDelegate);return i;};f._mouseUp=function(i){var h=this;c(document).unbind("touchmove."+h.widgetName,h._touchMoveDelegate).unbind("touchend."+h.widgetName,h._touchEndDelegate);return e.call(h,i);};})(jQuery);
