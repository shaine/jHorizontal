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

  var name = 'jhorizontal';

  function jHorizontal(el, opts) {
    this.$el  = $(el);

    this.defaults = {
      optionA: 'someOption',
      optionB: 'someOtherOption'
    };

    // let's use our name variable here as well for our meta options
   var meta = this.$el.data(name + '-opts');
   this.opts = $.extend(this.defaults, opts, meta);

   this.$el.data(name, this);

    //this.$header = this.$el.find('.header');
    //this.$body   = this.$el.find('.body');

    this.init();
  }

  jHoriztonal.prototype.init = function() {
  };

  jHoriztonal.prototype.destroy = function() {
    this.$el.off('.' + name);
    this.$el.find('*').off('.' + name);

    this.$el.removeData(name);
    this.$el = null;
  };

  $.fn.jhorizontal = function(opts) {
    return this.each(function() {
      new jHorizontal(this, opts);
    });
  };
})(jQuery, document, window);)

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
