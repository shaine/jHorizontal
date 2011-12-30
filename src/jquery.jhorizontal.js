(function($) {
  $.fn.jHorizontal = function(arg) {
    if(methods[arg]) {
      return methods[arg].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' +  arg + ' does not exist in jHorizontal.');
    }
  };
  
  var methods = {
    init : function(options) { 
      
    }
  };
})(jQuery);