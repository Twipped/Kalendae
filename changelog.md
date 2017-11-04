# Changelog

## 0.7.1

* Switch to UglifyJS to fix the broken minified build. (\#212)

## 0.7.0

* \#191 / \#185 Added config option `closeOnSelection` for Kalendae.Input de-focus the input field (and dismiss the date picker) once a selection has been made.

* \#187 / \#188 Fix bug with date selection on touch devices

* \#161 DOM Structure changes to facilitate deeper styling of the date picker.

  * **Element Structure**:
    * The title is split into 2 divs for month and year so that they can be styled separately if needed. (Only breaking if your css selected `span.k-caption` instead of just `.k-caption`).

  * New Options
    * `endDate` - defines the last day and month which will be selectable. Prevents navigating past in months/years.
    * `titleFormat` is replaced by the two below  to accomodate the new title div structure:
      * `titleMonthFormat`
      * `titleYearFormat`

  * New Methods
    * `removeAllSelected()` - Added to clear all selected values at once if mode is anything other than `'single'`.

  * New Events
    * `draw-end`- Added to enable view changes that depend on new data. Such as jQuery or other DOM maniuplations.

    * **Examples**
        * Added examples for: `endDate`,

    * **Misc.**
        * Experimental: Specifying options for `disableNextMonth` & `disableNextYear` may actually work

## 0.6.1

* \#84 Added `k-range-start` and `k-range-end` css classes to the first and last selected days in a range calender.

* \#164 `Input#destroy` no longer uses the `DOMElement#remove()` function, as that is not present in Internet Explorer.

* \#177 Fix a case where in some circumstances the next month button would not be available.

## 0.6

* \#176 **POTENTIALLY BREAKING CHANGE** Now includes a UMD wrapper for loading in AMD and CommonJS environments. If you are using Kalendae in these environments with a shim, you will need to remove the shim.

  - Standalone still bundles moment.js, non-standalone requires `'moment'` at load time.

* \#168 New `dayHeaderClickable` option (defaults to false) allows the user to click on the day column headers to select all days for that month.

* \#165/\#167 Today reference is no longer cached in memory, and thus updates when the computer crosses 12am.


## 0.5.5

* Kalendae CSS changed to use box-sizing:border-box.

* \#155 Fixed bug in input date parsing due to years being compared wrong.

* \#156 Change events will now bubble up through the DOM

* \#153 Fix issue with initialization on an input with a default value

* \#159 Fix deprecated usage of Moment.subtract()

## 0.5.4

* \#134/\#149 Fix (hopefully) for daylight savings time oddities in Safari.

## 0.5.3

* Bad release, nothing to see here

## 0.5.2

* Fixing incorrect main file location in bower.json

## 0.5.1

### Resolved Issues

* \#142 Correct for deprecated usage of Moment.add()

* \#136 Added "bottom right" as a side option for inputs.

* \#118 Use `jQuery` not `$` for the jQuery integration.


## 0.5.0

### New features

* \#112 Fire DOM change when choosing date

* \#111 Remove container on input destroy

* \#95 Support for week select

### Resolved Issues

* \#110 Only include valid dates

* \#90 Today not respecting current timezone

* \#87 ```getSelected``` does not return ```undefined``` anymore

* \#87 Key presses in the input field no longer cause the field contents to be overwritten with an invalid date.


## 0.4.1

### Resolved Issues

* \#83 Close button now works on IE9/IE10

* \#68, \#76 Using ```config.format``` in blackout dates
