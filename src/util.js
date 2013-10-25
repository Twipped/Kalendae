
var util = Kalendae.util = {

	isIE8: function() {
		return !!( (/msie 8./i).test(navigator.appVersion) && !(/opera/i).test(navigator.userAgent) && window.ActiveXObject && XDomainRequest && !window.msPerformance );
	},

// ELEMENT FUNCTIONS

	$: function (elem) {
		return (typeof elem == 'string') ? document.getElementById(elem) : elem;
	},

	$$: function (selector) {
		return document.querySelectorAll(selector);
	},

	make: function (tagName, attributes, attach) {
		var k, e = document.createElement(tagName);
		if (!!attributes) for (k in attributes) if (attributes.hasOwnProperty(k)) e.setAttribute(k, attributes[k]);
		if (!!attach) attach.appendChild(e);
		return e;
	},

	// Returns true if the DOM element is visible, false if it's hidden.
	// Checks if display is anything other than none.
	isVisible: function (elem) {
		// shamelessly copied from jQuery
		return elem.offsetWidth > 0 || elem.offsetHeight > 0;
	},

	getStyle: function (elem, styleProp) {
		var y, s;
		if (elem.currentStyle) {
			y = elem.currentStyle[styleProp];
		} else if (window.getComputedStyle) {
      s = window.getComputedStyle(elem, null);
      y = s ? s[styleProp] : '';
		}
		return y;
	},

	domReady: function (f) {
		var state = document.readyState;
		if (state === 'complete' || state === 'interactive') {
			f();
		} else {
			setTimeout(function() { util.domReady(f); }, 9);
		}
	},

	// Adds a listener callback to a DOM element which is fired on a specified
	// event.  Callback is sent the event object and the element that triggered the event
	addEvent: function (elem, eventName, callback) {
		var listener = function (event) {
			event = event || window.event;
			var target = event.target || event.srcElement;
			var block = callback.apply(elem, [event, target]);
			if (block === false) {
				if (!!event.preventDefault) event.preventDefault();
				else {
					event.returnValue = false;
					event.cancelBubble = true;
				}
			}
			return block;
		};
		if (elem.attachEvent) { // IE only.  The "on" is mandatory.
			elem.attachEvent("on" + eventName, listener);
		} else { // Other browsers.
			elem.addEventListener(eventName, listener, false);
		}
		return listener;
	},

	// Removes a listener callback from a DOM element which is fired on a specified
	// event.
	removeEvent: function (elem, event, listener) {
		if (elem.detachEvent) {	// IE only.  The "on" is mandatory.
			elem.detachEvent("on" + event, listener);
		} else { // Other browsers.
			elem.removeEventListener(event, listener, false);
		}
	},

	fireEvent: function (elem, event) {
		if (document.createEvent) {
			var e = document.createEvent('HTMLEvents');
			e.initEvent(event, false, true);
			elem.dispatchEvent(e);
		} else if (document.createEventObject) {
			elem.fireEvent('on' + event) ;
		} else if (typeof elem['on' + event] == 'function' ) {
			elem['on' + event]();
		}
	},

	hasClassName: function(elem, className) { //copied and modified from Prototype.js
		if (!(elem = util.$(elem))) return false;
		var eClassName = elem.className;
		return (eClassName.length > 0 && (eClassName == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(eClassName)));
	},

	addClassName: function(elem, className) { //copied and modified from Prototype.js
		if (!(elem = util.$(elem))) return;
		if (!util.hasClassName(elem, className)) elem.className += (elem.className ? ' ' : '') + className;
	},

	removeClassName: function(elem, className) { //copied and modified from Prototype.js
		if (!(elem = util.$(elem))) return;
		elem.className = util.trimString(elem.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
	},

	isFixed: function (elem) {
		do {
			if (util.getStyle(elem, 'position') === 'fixed') return true;
		} while ((elem = elem.offsetParent));
		return false;
	},

	scrollContainer: function (elem) {
		do {
			var overflow = util.getStyle(elem, 'overflow');
			if (overflow === 'auto' || overflow === 'scroll') return elem;
		} while ((elem = elem.parentNode) && elem != window.document.body);
		return null;
	},

	getPosition: function (elem, isInner) {
		var x = elem.offsetLeft,
			y = elem.offsetTop,
			r = {};

		if (!isInner) {
			while ((elem = elem.offsetParent)) {
				x += elem.offsetLeft;
				y += elem.offsetTop;
			}
		}

		r[0] = r.left = x;
		r[1] = r.top = y;
		return r;
	},

	getHeight: function (elem) {
		return elem.offsetHeight || elem.scrollHeight;
	},

	getWidth: function (elem) {
		return elem.offsetWidth || elem.scrollWidth;
	},


// TEXT FUNCTIONS

	trimString: function (input) {
		return input.replace(/^\s+/, '').replace(/\s+$/, '');
	},


// OBJECT FUNCTIONS

	merge: function () {
		/* Combines multiple objects into one.
		 * Syntax: util.extend([true], object1, object2, ... objectN)
		 * If first argument is true, function will merge recursively.
		 */

		var deep = (arguments[0]===true),
			d = {},
			i = deep?1:0;

		var _c = function (a, b) {
			if (typeof b !== 'object') return;
			for (var k in b) if (b.hasOwnProperty(k)) {
				//if property is an object or array, merge the contents instead of overwriting, if extend() was called as such
				if (deep && typeof a[k] === 'object' && typeof b[k] === 'object') _update(a[k], b[k]);
				else a[k] = b[k];
			}
			return a;
		};

		for (; i < arguments.length; i++) {
			_c(d, arguments[i]);
		}
		return d;
	},

	isArray: function (array) {
		return Object.prototype.toString.call(array) == "[object Array]";
	}
};

