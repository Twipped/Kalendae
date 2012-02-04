var Kalendae = function (options) {
	var opts = this.settings = util.merge(this.defaults, options),
		$container = this.container = util.make('div', {'class':this.classes.container}),
		calendars = this.calendars = [],
		startDay = moment().day(opts.weekStart),
		viewStartDate,
		columnHeaders = [],
		$cal,
		$title,
		$caption,
		$header,
		$days, dayNodes = [],
		$span,
		i = 0,
		j = this.settings.months;
	
	//generate the column headers (Su, Mo, Tu, etc)
	i = 7;
	while (i--) {
		columnHeaders.push( startDay.format('ddd').substr(0,opts.columnHeaderLength) );
		startDay.add('days',1);
	}
	
	//setup publish/subscribe and apply any subscriptions passed in settings
	MinPubSub(this);
	if (typeof opts.subscribe === 'object') {
		for (i in opts.subscribe) if (opts.subscribe.hasOwnProperty(i)) {
			this.subscribe(i, opts.subscribe[i]);
		}
	}
	
	//process default selected dates
	this.selected = [];
	if (!!opts.selected) this.setSelected(opts.selected, false);

	//set the view month
	if (!!opts.viewStartDate) {
		viewStartDate = moment(opts.viewStartDate, opts.format);
	} else if (this.selected.length > 0) {
		viewStartDate = moment(this.selected[0]);
	} else {
		viewStartDate = moment();
	}
	this.viewStartDate = viewStartDate.date(1);
	
	
	if (typeof opts.blackout === 'function') {
		this.blackout = opts.blackout;
	} else if (!!opts.blackout) {
		var bdates = parseDates(opts.blackout, this.settings.parseSplitDelimiter);
		this.blackout = function (input) {
			input = moment(input).hours(0).minutes(0).seconds(0).valueOf();
			if (input < 1 || !this.selected || this.selected.length < 1) return false;
			var i = bdates.length;
			while (i--) if (bdates[i].valueOf() === input) return true;
			return false;			
		}
	} else {
		this.blackout = function () {return false;}
	}
	
	
	//for the total months setting, generate N calendar views and add them to the container
	j = Math.max(this.settings.months,1);
	while (j--) {
		$container.appendChild($cal = util.make('div', {'class':this.classes.calendar}));
		
		$cal.setAttribute('data-cal-index', j);
		if (this.settings.months > 1) {
			if (j == Math.max(this.settings.months-1,1)) util.addClassName($cal, this.classes.monthFirst);
			else if (j === 0) util.addClassName($cal, this.classes.monthLast);
			else util.addClassName($cal, this.classes.monthMiddle);
		}
		
		//title bar
		$cal.appendChild($title = util.make('div', {'class':this.classes.title}));
		$title.appendChild(util.make('a', {'class':this.classes.previous}));	//previous button
		$title.appendChild(util.make('a', {'class':this.classes.next}));		//next button
		$title.appendChild($caption = util.make('span', {'class':this.classes.caption}));	//title caption
		
		//column headers
		$cal.appendChild($header = util.make('div', {'class':this.classes.header}));
		i = 0;
		do {
			$header.appendChild($span = util.make('span'));
			$span.innerHTML = columnHeaders[i];
		} while (++i < 7)

		//individual day cells
		$cal.appendChild($days = util.make('div', {'class':this.classes.days}));
		i = 0;
		dayNodes = [];
		while (i++ < 42) {
			$days.appendChild($span = util.make('span'));
			dayNodes.push($span);
		}

		//store each calendar view for easy redrawing
		calendars.push({
			caption:$caption,
			days:dayNodes
		});
		
		if (j) $container.appendChild(util.make('div', {'class':this.classes.monthSeparator}));
	}
	
	this.draw();
	
	var that = this;
	util.addEvent($container, 'click', function (event, target) {
		var clickedDate;
		if (util.hasClassName(target, that.classes.next)) {
		//NEXT MONTH BUTTON
			if (that.publish('view-changed', that, ['next']) !== false) {
				that.viewStartDate.add('months',1);
				that.draw();
			}
			event.preventDefault();
			return true;
			
			
		} else if (util.hasClassName(target, that.classes.previous)) {
		//PREVIOUS MONTH BUTTON
			if (that.publish('view-changed', that, ['previous']) !== false) {
				that.viewStartDate.subtract('months',1);
				that.draw();
			}
			event.preventDefault();
			return true;
			
			
		} else if (util.hasClassName(target.parentNode, that.classes.days) && util.hasClassName(target, that.classes.dayActive) && (clickedDate = target.getAttribute('data-date'))) {
		//DAY CLICK
			clickedDate = moment(clickedDate, that.settings.dayAttributeFormat);
			if (that.publish('date-clicked', that, [clickedDate]) !== false) {
			
				switch (that.settings.mode) {
					case 'multiple':
						if (!that.addSelected(clickedDate)) that.removeSelected(clickedDate);
						break;
					case 'range':
						that.addSelected(clickedDate);
						break;
					case 'single':
						/* falls through */
					default:
						that.addSelected(clickedDate);
						break;
				}

			}
			event.preventDefault();
			return true;
			
		}
	});
	

	if (!!(opts.attachTo = util.$(opts.attachTo))) {
		opts.attachTo.appendChild($container);
	}
	
};

Kalendae.prototype = {
	'defaults' : {
		attachTo:				null,			/* the element to attach the root container to. can be string or DOMElement */
		months:					1,				/* total number of months to display side by side */
		weekStart:				0,				/* day to use for the start of the week. 0 is Sunday */
		direction:				'any',			/* past, today-past, any, today-future, future */
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
		parseSplitDelimiter:	/,\s*|\s*-\s*/,	/* regex to use for splitting multiple dates from a passed string */
		rangeDelimiter:			' - ',			/* string to use between dates when outputting in range mode */
		multipleDelimiter:		', '			/* string to use between dates when outputting in multiple mode */
	},
	'classes' : {
		'container'			:'kalendae',
		'calendar'			:'k-calendar',
		'monthFirst'		:'k-first-month',
		'monthMiddle'		:'k-middle-month',
		'monthLast'			:'k-last-month',
		'title'				:'k-title',
		'previous'			:'k-previous',
		'next'				:'k-next',
		'caption'			:'k-caption',
		'header'			:'k-header',
		'days'				:'k-days',
		'dayOutOfMonth'		:'k-out-of-month',
		'dayActive'			:'k-active',
		'daySelected'		:'k-selected',
		'dayInRange'		:'k-range',
		'dayToday'			:'k-today',
		'monthSeparator'	:'k-separator'
	},
	
	'getSelectedAsDates' : function getSelectedAsDates() {
		var out = [];
		var i=0, c = this.selected.length;
		for (;i<c;i++) {
			out.push(this.selected[i]['native']());
		}
		return out;
	},
	
	'getSelectedAsText' : function getSelectedAsText(format) {
		var out = [];
		var i=0, c = this.selected.length;
		for (;i<c;i++) {
			out.push(this.selected[i].format(format || this.settings.format || 'YYYY-MM-DD'))
		}
		return out;
	},
	
	'getSelectedRaw' : function getSelected() {
		var out = [];
		var i=0, c = this.selected.length;
		for (;i<c;i++) {
			out.push(moment(this.selected[i]))
		}
		return out;
	},
	
	'getSelected' : function getSelected(format) {
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
	
	'isSelected' : function isSelected(input) {
		input = moment(input).hours(0).minutes(0).seconds(0).valueOf();
		if (input < 1 || !this.selected || this.selected.length < 1) return false;

		switch (this.settings.mode) {
			case 'range':
				var a = this.selected[0] ? this.selected[0].valueOf() : 0,
					b = this.selected[1] ? this.selected[1].valueOf() : 0;

				if (a === input || b === input) return 1;
				if (!a || !b) return 0;

				if ((input > a && input < b) || (a<b && input < a && input > b))  return -1;
				return false;

			case 'multiple':
				var i = this.selected.length;
				while (i--) {
					if (this.selected[i].valueOf() === input) {
						return true;
					}
				}
				return false;


			case 'single':
				/* falls through */
			default:
				return (this.selected[0] && (this.selected[0].valueOf() === input));
		}

		return false;
	},
	
	'setSelected' : function setSelected(input, draw) {
		this.selected = parseDates(input, this.settings.parseSplitDelimiter);
		this.selected.sort(function (a,b) {return a.valueOf() - b.valueOf();});

		this.publish('change', this);
		if (draw !== false) this.draw();
	},
	
	'addSelected' : function addSelected(date, draw) {
		date = moment(date).hours(0).minutes(0).seconds(0);
		switch (this.settings.mode) {
			case 'multiple':
				if (!this.isSelected(date)) this.selected.push(date);
				else return false;
				break;
			case 'range':

				if (this.selected.length !== 1) this.selected = [date];
				else {
					if (date.valueOf() > this.selected[0].valueOf()) this.selected[1] = date;
					else this.selected = [date, this.selected[0]];
				}
				break;
			case 'single':
				/* falls through */
			default:
				this.selected = [date];
				break;
		}
		this.selected.sort(function (a,b) {return a.valueOf() - b.valueOf();});
		this.publish('change', this);
		if (draw !== false) this.draw();
		return true;
	},
	
	'removeSelected' : function removeSelected(date, draw) {
		date = moment(date).hours(0).minutes(0).seconds(0).valueOf();
		var i = this.selected.length;
		while (i--) {
			if (this.selected[i].valueOf() === date) {
				this.selected.splice(i,1);
				this.publish('change', this);
				if (draw !== false) this.draw();
				return true;
			}
		}
		return false;
	},
	
	'draw' : function fill() {
		// return;
		var month = moment(this.viewStartDate),
			day,
			today = moment().hours(0).minutes(0).seconds(0),
			cal,
			$span,
			klass,
			i=0, c,
			j=0, k,
			s;

		c = this.calendars.length;
		do {
			day = moment(month).date(1).day(this.settings.weekStart);
			cal = this.calendars[i];
			cal.caption.innerHTML = month.format(this.settings.titleFormat);
			j = 0;
			do {
				$span = cal.days[j];

				klass = [];

				s = this.isSelected(day);
				if (s) klass.push(({'-1':this.classes.dayInRange,'1':this.classes.daySelected, 'true':this.classes.daySelected})[s]);

				if (day.month() != month.month()) klass.push(this.classes.dayOutOfMonth);
				else if (!this.blackout(day) || s>0) klass.push(this.classes.dayActive);

				if (Math.floor(today.diff(day, 'days', true)) === 0) klass.push(this.classes.dayToday);

				$span.innerHTML = day.format(this.settings.dayNumberFormat);
				$span.className = klass.join(' ');
				$span.setAttribute('data-date', day.format(this.settings.dayAttributeFormat));

				day.add('days',1);
			} while (++j < 42);
			month.add('months',1);
		} while (++i < c);

	}
}

var parseDates = function parseDates(input, delimiter) {
	var output = [];
	
	if (typeof input === 'string') {
		input = input.split(delimiter);		
	} else if (!unit.isArray(input)) {
		input = [sel_in];
	}
	
	c = input.length;
	i = 0;
	do {
		output.push( moment(input[i]).hours(0).minutes(0).seconds(0) );
	} while (++i < c);
	
	return output;
}



window.Kalendae = Kalendae;


