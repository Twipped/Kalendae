var today;

var Kalendae = function (targetElement, options) {
	//if the first argument isn't an element and isn't a string, assume that it is the options object
	if (!(targetElement instanceof Element || typeof targetElement === 'string')) options = targetElement;
	
	var self = this,
		classes = self.classes,
		opts = self.settings = util.merge(self.defaults, {attachTo:targetElement}, options || {}),
		$container = self.container = util.make('div', {'class':classes.container}),
		calendars = self.calendars = [],
		startDay = moment().day(opts.weekStart),
		vsd,
		columnHeaders = [],
		$cal,
		$title,
		$caption,
		$header,
		$days, dayNodes = [],
		$span,
		i = 0,
		j = opts.months;
	
	if (util.isIE8()) util.addClassName($container, 'ie8');
	
	//generate the column headers (Su, Mo, Tu, etc)
	i = 7;
	while (i--) {
		columnHeaders.push( startDay.format('ddd').substr(0,opts.columnHeaderLength) );
		startDay.add('days',1);
	}
	
	//setup publish/subscribe and apply any subscriptions passed in settings
	MinPubSub(self);
	if (typeof opts.subscribe === 'object') {
		for (i in opts.subscribe) if (opts.subscribe.hasOwnProperty(i)) {
			self.subscribe(i, opts.subscribe[i]);
		}
	}
	
	//process default selected dates
	self._sel = [];
	if (!!opts.selected) self.setSelected(opts.selected, false);

	//set the view month
	if (!!opts.viewStartDate) {
		vsd = moment(opts.viewStartDate, opts.format);
	} else if (self._sel.length > 0) {
		vsd = moment(self._sel[0]);
	} else {
		vsd = moment();
	}
	self.viewStartDate = vsd.date(1);
	
	var viewDelta = ({
		'past'			: opts.months-1,
		'today-past'	: opts.months-1,
		'any'			: opts.months>2?Math.floor(opts.months/2):0,
		'today-future'	: 0,
		'future'		: 0
	})[this.settings.direction];


	if (viewDelta && moment().month()==moment(self.viewStartDate).month()){
		self.viewStartDate = moment(self.viewStartDate).subtract({M:viewDelta}).date(1);
	}


	if (typeof opts.blackout === 'function') {
		self.blackout = opts.blackout;
	} else if (!!opts.blackout) {
		var bdates = parseDates(opts.blackout, opts.parseSplitDelimiter);
		self.blackout = function (input) {
			input = moment(input).yearDay();
			if (input < 1 || !self._sel || self._sel.length < 1) return false;
			var i = bdates.length;
			while (i--) if (bdates[i].yearDay() === input) return true;
			return false;			
		}
	} else {
		self.blackout = function () {return false;}
	}
	
	
	self.direction = self.directions[opts.direction] ? self.directions[opts.direction] : self.directions['any'];
	
	
	//for the total months setting, generate N calendar views and add them to the container
	j = Math.max(opts.months,1);
	while (j--) {
		$cal = util.make('div', {'class':classes.calendar}, $container);
		
		$cal.setAttribute('data-cal-index', j);
		if (opts.months > 1) {
			if (j == Math.max(opts.months-1,1)) util.addClassName($cal, classes.monthFirst);
			else if (j === 0) util.addClassName($cal, classes.monthLast);
			else util.addClassName($cal, classes.monthMiddle);
		}
		
		//title bar
		$title = util.make('div', {'class':classes.title}, $cal);
		util.make('a', {'class':classes.previousYear}, $title);	//previous button
		util.make('a', {'class':classes.previousMonth}, $title);	//previous button
		util.make('a', {'class':classes.nextYear}, $title);		//next button
		util.make('a', {'class':classes.nextMonth}, $title);		//next button
		$caption = util.make('span', {'class':classes.caption}, $title);	//title caption
		
		//column headers
		$header = util.make('div', {'class':classes.header}, $cal);
		i = 0;
		do {
			$span = util.make('span', {}, $header);
			$span.innerHTML = columnHeaders[i];
		} while (++i < 7)

		//individual day cells
		$days = util.make('div', {'class':classes.days}, $cal);
		i = 0;
		dayNodes = [];
		while (i++ < 42) {
			dayNodes.push(util.make('span', {}, $days));
		}

		//store each calendar view for easy redrawing
		calendars.push({
			caption:$caption,
			days:dayNodes
		});
		
		if (j) util.make('div', {'class':classes.monthSeparator}, $container);
	}
	
	self.draw();
	
	util.addEvent($container, 'mousedown', function (event, target) {
		var clickedDate;
		if (util.hasClassName(target, classes.nextMonth)) {
		//NEXT MONTH BUTTON
			if (!self.disableNext && self.publish('view-changed', self, ['next-month']) !== false) {
				self.viewStartDate.add('months',1);
				self.draw();
			}
			return false;			
			
		} else if (util.hasClassName(target, classes.previousMonth)) {
		//PREVIOUS MONTH BUTTON
			if (!self.disablePreviousMonth && self.publish('view-changed', self, ['previous-month']) !== false) {
				self.viewStartDate.subtract('months',1);
				self.draw();
			}
			return false;
			
		} else if (util.hasClassName(target, classes.nextYear)) {
		//NEXT MONTH BUTTON
			if (!self.disableNext && self.publish('view-changed', self, ['next-year']) !== false) {
				self.viewStartDate.add('years',1);
				self.draw();
			}
			return false;			

		} else if (util.hasClassName(target, classes.previousYear)) {
		//PREVIOUS MONTH BUTTON
			if (!self.disablePreviousMonth && self.publish('view-changed', self, ['previous-year']) !== false) {
				self.viewStartDate.subtract('years',1);
				self.draw();
			}
			return false;


			
		} else if (util.hasClassName(target.parentNode, classes.days) && util.hasClassName(target, classes.dayActive) && (clickedDate = target.getAttribute('data-date'))) {
		//DAY CLICK
			clickedDate = moment(clickedDate, opts.dayAttributeFormat).hours(12);
			if (self.publish('date-clicked', self, [clickedDate]) !== false) {
			
				switch (opts.mode) {
					case 'multiple':
						if (!self.addSelected(clickedDate)) self.removeSelected(clickedDate);
						break;
					case 'range':
						self.addSelected(clickedDate);
						break;
					case 'single':
						/* falls through */
					default:
						self.addSelected(clickedDate);
						break;
				}

			}
			return false;
			
		}
		return false;
	});
	

	if (!!(opts.attachTo = util.$(opts.attachTo))) {
		opts.attachTo.appendChild($container);
	}
	
};

Kalendae.prototype = {
	defaults : {
		attachTo:				null,			/* the element to attach the root container to. can be string or DOMElement */
		months:					1,				/* total number of months to display side by side */
		weekStart:				0,				/* day to use for the start of the week. 0 is Sunday */
		direction:				'any',			/* past, today-past, any, today-future, future */
		directionScrolling:		true,			/* if a direction other than any is defined, prevent scrolling out of range */
		viewStartDate:			null,			/* date in the month to display.  When multiple months, this is the left most */
		blackout:				null,			/* array of dates, or function to be passed a date */
		selected:				null,			/* dates already selected.  can be string, date, or array of strings or dates. */
		mode:					'single',		/* single, multiple, range */
		format:					null,			/* string used for parsing dates. */
		subscribe:				null,			/* object containing events to subscribe to */

		columnHeaderLength:		2,				/* number of characters to show in the column headers */
		titleFormat:			'MMMM, YYYY',	/* format mask for month titles. See momentjs.com for rules */
		dayNumberFormat:		'D',			/* format mask for individual days */
		dayAttributeFormat:		'YYYY-MM-DD',	/* format mask for the data-date attribute set on every span */
		parseSplitDelimiter:	/,\s*|\s+-\s+/,	/* regex to use for splitting multiple dates from a passed string */
		rangeDelimiter:			' - ',			/* string to use between dates when outputting in range mode */
		multipleDelimiter:		', ',			/* string to use between dates when outputting in multiple mode */
		
		dateClassMap:			{}
	},
	classes : {
		container		:'kalendae',
		calendar		:'k-calendar',
		monthFirst		:'k-first-month',
		monthMiddle		:'k-middle-month',
		monthLast		:'k-last-month',
		title			:'k-title',
		previousMonth	:'k-btn-previous-month',
		nextMonth		:'k-btn-next-month',
		previousYear	:'k-btn-previous-year',
		nextYear		:'k-btn-next-year',
		caption			:'k-caption',
		header			:'k-header',
		days			:'k-days',
		dayOutOfMonth	:'k-out-of-month',
		dayActive		:'k-active',
		daySelected		:'k-selected',
		dayInRange		:'k-range',
		dayToday		:'k-today',
		monthSeparator	:'k-separator',
		disablePreviousMonth	:'k-disable-previous-month-btn',
		disableNextMonth		:'k-disable-next-month-btn',
		disablePreviousYear		:'k-disable-previous-year-btn',
		disableNextYear			:'k-disable-next-year-btn'
	},
	
	disablePreviousMonth: false,
	disableNextMonth: false,
	disablePreviousYear: false,
	disableNextYear: false,
	
	directions: {
		'past'			:function (date) {return moment(date).yearDay() >= today.yearDay();}, 
		'today-past'	:function (date) {return moment(date).yearDay() > today.yearDay();}, 
		'any'			:function (date) {return false;}, 
		'today-future'	:function (date) {return moment(date).yearDay() < today.yearDay();}, 
		'future'		:function (date) {return moment(date).yearDay() <= today.yearDay();}
	},
	
	getSelectedAsDates : function () {
		var out = [];
		var i=0, c = this._sel.length;
		for (;i<c;i++) {
			out.push(this._sel[i].nativeDate());
		}
		return out;
	},
	
	getSelectedAsText : function (format) {
		var out = [];
		var i=0, c = this._sel.length;
		for (;i<c;i++) {
			out.push(this._sel[i].format(format || this.settings.format || 'YYYY-MM-DD'))
		}
		return out;
	},
	
	getSelectedRaw : function () {
		var out = [];
		var i=0, c = this._sel.length;
		for (;i<c;i++) {
			out.push(moment(this._sel[i]))
		}
		return out;
	},
	
	getSelected : function (format) {
		var sel = this.getSelectedAsText(format);
		switch (this.settings.mode) {
			case 'range':
				sel.splice(2); //shouldn't be more than two, but lets just make sure.
				return sel.join(this.settings.rangeDelimiter);

			case 'multiple':
				return sel.join(this.settings.multipleDelimiter);

			case 'single':
				/* falls through */
			default:
				return sel[0];
		}
	},
	
	isSelected : function (input) {
		input = moment(input).yearDay();
		if (input < 1 || !this._sel || this._sel.length < 1) return false;

		switch (this.settings.mode) {
			case 'range':
				var a = this._sel[0] ? this._sel[0].yearDay() : 0,
					b = this._sel[1] ? this._sel[1].yearDay() : 0;

				if (a === input || b === input) return 1;
				if (!a || !b) return 0;

				if ((input > a && input < b) || (a<b && input < a && input > b))  return -1;
				return false;

			case 'multiple':
				var i = this._sel.length;
				while (i--) {
					if (this._sel[i].yearDay() === input) {
						return true;
					}
				}
				return false;


			case 'single':
				/* falls through */
			default:
				return (this._sel[0] && (this._sel[0].yearDay() === input));
		}

		return false;
	},
	
	setSelected : function (input, draw) {
		this._sel = parseDates(input, this.settings.parseSplitDelimiter, this.settings.format);
		this._sel.sort(function (a,b) {return a.yearDay() - b.yearDay();});

		if (draw !== false) this.draw();
	},
	
	addSelected : function (date, draw) {
		date = moment(date).hours(12);
		switch (this.settings.mode) {
			case 'multiple':
				if (!this.isSelected(date)) this._sel.push(date);
				else return false;
				break;
			case 'range':

				if (this._sel.length !== 1) this._sel = [date];
				else {
					if (date.yearDay() > this._sel[0].yearDay()) this._sel[1] = date;
					else this._sel = [date, this._sel[0]];
				}
				break;
			case 'single':
				/* falls through */
			default:
				this._sel = [date];
				break;
		}
		this._sel.sort(function (a,b) {return a.yearDay() - b.yearDay();});
		this.publish('change', this);
		if (draw !== false) this.draw();
		return true;
	},
	
	removeSelected : function (date, draw) {
		date = moment(date).yearDay();
		var i = this._sel.length;
		while (i--) {
			if (this._sel[i].yearDay() === date) {
				this._sel.splice(i,1);
				this.publish('change', this);
				if (draw !== false) this.draw();
				return true;
			}
		}
		return false;
	},
	
	draw : function draw() {
		// return;
		var month = moment(this.viewStartDate).hours(12), //force middle of the day to avoid any weird date shifts
			day,
			classes = this.classes,
			cal,
			$span,
			klass,
			i=0, c,
			j=0, k,
			s,
			dateString,
			opts = this.settings;

		c = this.calendars.length;

		do {
			day = moment(month).date(1);
			day.day( day.day() < this.settings.weekStart ? this.settings.weekStart-7 : this.settings.weekStart); 
			//if the first day of the month is less than our week start, back up a week

			cal = this.calendars[i];
			cal.caption.innerHTML = month.format(this.settings.titleFormat);
			j = 0;
			do {
				$span = cal.days[j];

				klass = [];

				s = this.isSelected(day);

				if (s) klass.push(({'-1':classes.dayInRange,'1':classes.daySelected, 'true':classes.daySelected})[s]);

				if (day.month() != month.month()) klass.push(classes.dayOutOfMonth);
				else if (!(this.blackout(day) || this.direction(day)) || s>0) klass.push(classes.dayActive);

				if (day.yearDay() === today.yearDay()) klass.push(classes.dayToday);

				dateString = day.format(this.settings.dayAttributeFormat);
				if (opts.dateClassMap[dateString]) klass.push(opts.dateClassMap[dateString]);

				$span.innerHTML = day.format(opts.dayNumberFormat);
				$span.className = klass.join(' ');
				$span.setAttribute('data-date', dateString);
				

				day.add('days',1);
			} while (++j < 42);
			month.add('months',1);
		} while (++i < c);
		
		if (opts.directionScrolling) {
			var diff = -(moment().diff(month, 'months'));		
			if (opts.direction==='today-past' || opts.direction==='past') {

				if (diff <= 0) {
					this.disableNextMonth = false;
					util.removeClassName(this.container, classes.disableNextMonth);
				} else {
					this.disableNextMonth = true;
					util.addClassName(this.container, classes.disableNextMonth);
				}

			} else if (opts.direction==='today-future' || opts.direction==='future') {

				if (diff > opts.months) {
					this.disablePreviousMonth = false;
					util.removeClassName(this.container, classes.disablePreviousMonth);
				} else {
					this.disablePreviousMonth = true;
					util.addClassName(this.container, classes.disablePreviousMonth);
				}

			}
			
				
			if (opts.direction==='today-past' || opts.direction==='past') {
				if (month.add({Y:1}).diff(moment(), 'years') < 0) {
					this.disableNextYear = false;
					util.removeClassName(this.container, classes.disableNextYear);
				} else {
					this.disableNextYear = true;
					util.addClassName(this.container, classes.disableNextYear);
				}

			} else if (opts.direction==='today-future' || opts.direction==='future') {
				if (month.subtract({Y:1}).diff(moment(), 'years') > 0) {
					this.disablePreviousYear = false;
					util.removeClassName(this.container, classes.disablePreviousYear);
				} else {
					this.disablePreviousYear = true;
					util.addClassName(this.container, classes.disablePreviousYear);
				}

			}
			
		}
	}
}

var parseDates = function (input, delimiter, format) {
	var output = [];
	
	if (typeof input === 'string') {
		input = input.split(delimiter);		
	} else if (!util.isArray(input)) {
		input = [input];
	}
	
	var c = input.length;
	i = 0;
	do {
		if (input[i]) output.push( moment(input[i], format).hours(12) );
	} while (++i < c);
	
	return output;
}



window.Kalendae = Kalendae;
