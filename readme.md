#Kalendae - A framework agnostic javascript date picker

Kalendae is an attempt to do something that nobody has yet been able to do: make a date picker that doesn't suck.  Kalendae provides the following features:

1. Fully portable, **no external dependencies**.  No jQuery, no Prototype, no MooTools; just add the script and the stylesheet and you're good to go.
2. Fully and easily skinable. The default theme uses only one image file (a mask for the previous and next buttons), everything else is styled using CSS.
3. Supports all modern browsers and IE8.
4. Support single day, multiple day, or day range selection.
5. Configurable number of months to be displayed at once.
6. Can be displayed on the page as an inline widget, or attached to one or more input fields as a popup control.
7. Can be attached to **any** page element, not just named elements.
8. Configurable blackouts, defined either as an array of dates or via a callback function
9. Output selected dates in a variety of formats
10. Leverages [moment.js](http://www.momentjs.com) for smart and easy date parsing.

##Screenshots

Default calendar, no options defined.  
![screenshot](http://i.imgur.com/Ig52z.png)

Two month calendar attached to an input element.  
![screenshot](http://i.imgur.com/GIR3g.png)

Two month, range selection, future dates only, with weekends blacked out:  
![screenshot](http://i.imgur.com/JzBc7.png)

###[View The Demo Page](http://chipersoft.github.com/Kalendae/)


##Usage

Copy the contents of the `build/` folder into wherever your website scripts are kept.  Include the JS and CSS files in the head of your document like so:

    <link rel="stylesheet" href="build/kalendae.css" type="text/css" charset="utf-8">
    <script src="build/kalendae.standalone.js" type="text/javascript" charset="utf-8"></script>

Once this is done you can initialize kalendae a number of ways.  The easiest method is to simply add the "auto-kal" class onto the element you want to calendar attached to.  The calendar will be created using the default settings.

    <div class="auto-kal"></div>

This works for input elements as well, providing a popup calendar.

    <input type="text" class="auto-kal">


If you want to override the default settings, you can use the data-kal attribute.

    <div class="auto-kal" data-kal="months: 3, direction: 'future'"></div>

Again, this will work for input elements as well.

You can also setup Kalendae manually via JavaScript code. This should be done either at the end of the page, or in the DOMReady/Load event. To do this you must instantiate one of two objects, the widget class `Kalendae`, or the input element popup class `Kalendae.Input`.  Both objects take two arguments:

1. targetElement - This is either an Element object, or the element's ID as a string.
2. options - An object containing the new options.  Any option omitted will revert to the default setting.

See the included index.html file for usage examples.

###jQuery

Kalendae does not require jQuery, but does provide a jQuery plugin when jQuery is available.  jQuery users may create a Kalendae widget or popup by calling `$(selector).kalendae(options)`.

##moment.js

To ease date handling processes, Kalendae bundles the [moment.js](http://www.momentjs.com) date handling library.  This bundled library has been altered to prevent it from being added to the global context, but is still available if you wish to use it in your own code.  Add the following directly after the `<script>` tag to make moment available for your application.

    <script type="text/javascript" charset="utf-8">
        window.moment = Kalendae.moment;
    </script>

##Options

The following options are available for configuration.

- `attachTo`:	The element that the calendar div will be appended to.  
    - In `Kalendae` this defaults to the first argument on the constructor.
    - In `Kalendae.Input` this defaults to the document body.
    - Can be an Element or an element's string ID.

- `format`: The format mask used when parsing date strings.  
    - Uses moment.js notation (see http://momentjs.com/docs/#/display/format )
    - If left undefined, will attempt to parse the date automatically.
    - Default is `null`.

- `mode`: Selection mode.
    - `"single"`: Allows selection of only one day. Clicks change the selected day.  This is the default.
    - `"multiple"`: Allows selection of multiple, non-sequential days. Clicks toggle a day's selection.
    - `"range"`: Selects multiple days in sequence. First click defines start of the range, second defines the end of the range.

- `selected`: The date selected when the calendar is created.
    - Values my be a string, JavaScript Date object, Moment object, or an array containing any of the three.
    - In "multiple" mode, strings may contain multiple dates separated by commas. *ex: 2/3/2012, 3/15/2012, 4/2/2012*
    - In "range" mode, strings may contain two dates separated by a hyphen. *ex: 2/3/2012 - 3/15/2012*

- `months`:	The total number of months to display side by side on the calendar.
    - Default is `1`.

- `weekStart`: The day to use for the start of the week.
    - 0 = Sunday, 1 = Monday, etc.
    - Default is `0`.

- `direction`: Restricts date selectability to past or future.
    - Accepted values: past, today-past, any, today-future, future
    - Stacks with `blackout`
    - Default is `"any"`

- `directionScrolling`: If `true` and a direction other than `any` is defined, Kalendae will not allow scrolling the view outside the direction.
    - Default is true.

- `blackout`: Dates to be disallowed from selection.
    - Can be an array of dates formatted according to `format`, or a function taking a moment date object as the first argument and returning true to prevent selection.
    - Stacks with `direction`
    - Default is `null`

- `viewStartDate`: Date defining the first month to display when created.
    - Uses the `format` definition.
    - Default is `null` (this month or month of first selected day).

- `dateClassMap`: A key/value collection of css classes organized by date.  String date keys found in this collection will have their value attached to the SPAN tag for the date.  This allows for custom coloring for specific days.  See the first example in index.html for usage.
    - Note that this property uses the `dayAttributeFormat` option, NOT the format option, for date strings.
    - Default is `null`.

- `dayOutOfMonthClickable`: Allow clicks on days that fall outside of the currently focused month. Default is `false`.

- `useYearNav`: Include the double-arrow year navigation. Default is `true`.

###Advanced Behavior Options

The following settings alter the internal behavior of Kalendae and should only be changed by advanced users.


- `columnHeaderFormat`:	The format of moment data of the week day name to display in column headers.
    - Default is `dd`
- `titleFormat`: Format string used in the calendar title.
    - Default is `"MMMM, YYYY"`

- `dayNumberFormat`: Format string for individual day numbers.
	- Default is `"D"`

- `dayAttributeFormat`: Format string for the `data-date` attribute set on every span 
    - Default is `"YYYY-MM-DD"`

- `parseSplitDelimiter`: RegExp used when splitting multiple dates from a passed string
    - Default is `/,\s*|\s*-\s*/`

- `rangeDelimiter`:	String used to delimit the start and end dates when outputting in range mode
	- Default is `' - '`

- `multipleDelimiter`: String used to delimit dates when outputting in multiple mode
    - Default is `', '`

###Example Blackout Functions

- Blackout weekends: `function (date) {return [1,0,0,0,0,0,1][Kalendae.moment(date).day()];}`
- Blackout every other day: `function (date) {return Kalendae.moment(date).date() % 2;}`
- Blackout every other week `function (date) {return Kalendae.moment(date).format('w') % 2;}`

##Member Functions

The following functions are available on the instantiated `Kalendae` and `Kalendae.Input` objects.

- `getSelected()`: Returns the selected dates as a formatted string.

- `getSelectedAsText()`: Returns the selected dates as an array of formatted strings.

- `getSelectedAsDates()`: Returns the selected dates as an array of JavaScript Date objects.

- `getSelectedRaw()`: Returns the selected dates as an array of moment objects.

- `isSelected(string|Date|moment)`: Returns a true or false indicating if the passed date is selected.

- `setSelected(string|Date|moment|Array)`: Sets the currently selected dates. See the `selected` option for accepted input.

- `addSelected(string|Date|moment)`: Adds the passed value to the selection. Behavior varies according to the `mode` option, but matches behavior of clicking on a day in the calendar.

- `removeSelected(string|Date|moment)`: removes the passed value from the selection.

- `draw()`: Forces a redraw of the calendar contents.

##Member Properties

The following properties are exposed on the instantiated `Kalendae` and `Kalendae.Input` objects.

- `settings`: The unified options object.

- `container`: The calendar container div that is inserted into the page.

- `calendars`: The individual month divs (see the `months` option).

##Kalendae Events

Kalendae uses a publish/subscribe event system.  To receive events from a Kalendae instance you can call the `subscribe()` function on the Kalendae instance, passing the event name and a callback function.  Example:

    var k = new Kalendae('myDiv');
    k.subscribe('change', function (date, action) {
       console.log(date, action, this.getSelected());
    });

Callbacks can also be passed in the options object:

    new Kalendae('myDiv', {
       subscribe: {
           'change': function (date, action) {
               console.log(date, action, this.getSelected());
           }
       }
    });

Kalendae offers the following events:

- `change` - Fires whenever the selected date changes, either from a user clicking or a call to `setSelected()`

- `date-clicked` - Fires when a date has been clicked, but before the selection is changed.  Receives the date clicked as a moment object in the first parameter.  Returning false will prevent selection change.

- `view-changed` - Fires when the user has clicked the next or previous month button, but before the calendar is redrawn.  Returning false will prevent the change.

Additionally, Kalendae.Input provides the following events:

- `show` - Fires when the calendar appears due to the input gaining focus

- `hide` - Fires when the calendar hides due to the input blurring


##Skinning Kalendae

Coming Soon.


##Building Kalendae

The Kalendae source code is assembled from multiple individual files.  A standard GNU makefile is included to compile the files together into the finished product.

To build Kalendae, navigate to the directory containing this readme file in the system terminal and run the `make` command.

To create a minified version, run `make minified`.  If the minified file is blank, run `make minified-test` to see what errors Google Closure Compiler is throwing.


##Contributing to Kalendae

1. Please submit all pull requests to the `dev` branch from your own named branch.
2. Please only include the changes within the `src/` directory, do not include new builds.
3. New code should match the existing code style, with hard tabs for indentation, spaces for alignment, and [BSD/KNF style bracketing](http://en.wikipedia.org/wiki/Indent_style#BSD_KNF_style).
4. Please be aware that I have family and work obligations and may take some time to respond to your Pull Request.

##License

Kalendae is released under an MIT license and is freely distributable.

