#Kalendae - A framework agnostic javascript date picker

Kalendae will attempt to do something that nobody has yet been able to do: make a date picker that doesn't suck.

Please note that Kalendae is still a work in progress and should probably not be used on live websites.  When completed Kalendae will have the following features:

1. Fully portable, **no dependencies**.  No jQuery, no Prototype, no MooTools; just add the script and the stylesheet and you're good to go.
2. Fully and easily skinable. The default theme uses only one image file (a mask for the previous and next buttons), everything else is styled using CSS.
3. Support single day, multiple day, or day range selection.
4. Configurable number of months displayed at once.
5. Display on the page as an inline widget, attached to one or more input fields, as a popup control, or as an overlay.
6. Be attached to **any** page element, not just named elements.
7. Configurable blackouts, either as an array of dates or via a callback function
8. Output selected dates in a variety of formats
9. Leverage [method.js](http://www.methodjs.com) for smart date parsing.
10. Support IE8 and above.
11. Keep it simple.

I might include a jquery plugin as an optional dependency, but that will be the last thing I implement.

Kalendae is released under an MIT license and is freely distributable.


##Building Kalendae

The Kalendae source code is assembled from multiple individual files.  A standard GNU makefile is included to compile the files together into the finished product.

To build Kalendae, navigate to the directory containing this readme file in the system terminal and run the `make` command. 

To create a minified version, run `make minified`.  If the minified file is blank, run `make minified-test` to see what errors Google Closure Compiler is throwing.