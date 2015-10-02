# Changelog

## Work In Progress

* Kalendae CSS changed to use box-sizing:border-box.
* \#155 Fixed bug in input date parsing due to years being compared wrong.
* \#156 Change events will now bubble up through the DOM
* \#153 Fix issue with initialization on an input with a default value

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
