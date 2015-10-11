# Pocketcasts Utils

Pocketcasts Utils is an UserScript that aims to enhance the default Pocketcasts interface and
experience.  It does this by both adding new, and streamlining existing functionality and
interfaces.

Of course, this should never result in degrading the overal experience.  Therefore, you can choose
to enable or disable any of it's features as you please.  These changes take effect immediately; you
can see their result in the background.  By default, certain options will be enabled/disabled, to
showcase the main features without getting in the way and overwhelming you.

The settings screen can be found under the cog in the top right corner (which, incidentally, is the
only thing you cannot turn off).  It's the 'Utils Settings' item from the dropdown menu.

## Development

### 0.x, 1.x

Life was simple back then. There was one js file, containing all code. This started out as a gist,
so there wasn't really much choice in that. Of course, maintainability suffered, and once the file
hit 1k+ lines, I got sick and tired of this. Thus, 2.x was born.

### 2.x

With 2.x, things moved to a repository, and I started to split up things into multiple files. No
more long files, inline css or inline images.

The code is written in [CoffeeScript](http://coffeescript.org/), and the styling is written in
[SCSS](http://sass-lang.com/).

The CoffeeScript code can be found in `src/coffee`. The main file is `main.coffee`.  I use macros
from [BlackCoffee](https://github.com/paiq/blackcoffee) to include external files, to make it easier
to inline everything into one file.

All CoffeeScript code is documented using [codo](https://github.com/coffeedoc/codo).

The SCSS styling can be found in `src/scss`. Each file represents a separate feature, and with the
exception of main.scss all styles can be disabled in the script using the settings page.

There are a few images, that are inlined into the CSS when compiling everything. Those can be found
in `src/images`.

The backbone of this all is [Grunt](http://gruntjs.com/), which is used to compile all the files
into one big .user.js file that you can use as an userscript.  Simply run `grunt` to compile the
files into one. Run `grunt watch` to auto-recompile when files are changed.

## Changelog

### [1.7.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.7.1) - 2015-05-16
 - Remember the chosen layout.

### [1.7.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.7.0) - 2015-05-16
 - Added extra layouts: grid with 4 or 5 icons in a row instead of 3, and list with 66% or 33% of
   the normal item height.

### [1.6.7](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.7) - 2015-04-17
 - Some small style tweaks in the style of new settings.

### [1.6.6](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.6) - 2015-04-17
 - Added some general help text/about text to the settings page. Add the settings page to the menu
   that was normally bound to the cog icon, instead of completely overriding this menu (whoops).
   When the script is updated,

### [1.6.5](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.5) - 2015-02-04
 - Fixed some bugs in the playlist mode, making it work more reliably.

### [1.6.4](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.4) - 2015-02-03
 - Added settings that allow you to show/hide the default menu items (Discover, etc).

### [1.6.3](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.3) - 2015-02-03
 - Added a setting to enable/disable the search box filtering episodes.
 - Fixed a bunch of indents again.

### [1.6.2](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.2) - 2015-02-03
 - Added groups to the settings page. Added help text to the settings. Added settings to show/hide
   each of the extra menu items.

### [1.6.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.1) - 2015-02-03
 - Don't auto-show the settings page.

### [1.6.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.6.0) - 2015-02-03
 - Added a settings page that allows you to turn the header hiding and the compact menu off.

### [1.5.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.5.1) - 2015-02-03
 - Split the styles up into multiple style blocks, grouped by what they do.  Added an end-of-queue
   announcement when playlist mode is on and there is nothing more to play.

### [1.5.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.5.0) - 2015-02-02
 - Added a style that auto-hides the header, and that makes the menu more compact.

### [1.4.5](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.4.5) - 2015-02-02
 - Removed a debug statement.

### [1.4.4](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.4.4) - 2015-02-02
 - Renamed some variables to better represent their contents, and to prevent conflicts.
 - Fixed a bumch of wrong/mixed indentation.

### [1.4.3](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.4.3) - 2015-02-01
 - Added an text-to-speech announcement of the next episode title before playing the next episode
   when in playlist mode.

### [1.4.2](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.4.2) - 2015-02-01
 - Fixed a small bug that sometimes caused the button states to not be updated correctly.

### [1.4.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.4.1) - 2015-02-01
 - Minor bugfix.

### [1.4.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.4.0) - 2015-02-01
 - Added a playlist mode that automatically plays the next episode when your episode is finished.

### [1.3.2](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.3.2) - 2015-02-01
 - Use the internal duration of episodes instead of parsing the formatted duration for the time
   stats.

### [1.3.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.3.1) - 2015-01-31
 - Fixed a bug in the search showing/hiding of episodes.

### [1.3.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.3.0) - 2015-01-31
 - Renamed a bunch of constants, moved some magic numbers to constants. Added functionality to the
   search box allowing it to also filter the currently loaded episode list.

### [1.2.3](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.2.3) - 2015-01-31
 - Made the stat time text in short format, and the full long version in the tooltip of the stat.

### [1.2.2](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.2.2) - 2015-01-30
 - Cleaned up the stats code a bit.Cleaned up the stats code a bit.

### [1.2.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.2.1) - 2015-01-30
 - Added times to the stats menu.

### [1.2.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.2.0) - 2015-01-30
 - Added a stats menu, showing the number of watched, unwatched and in progress episodes that are
   currently loaded.

### [1.1.2](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.1.2) - 2015-01-22
 - Moved the styles from inline to style elements, using a sort of heredocs.

### [1.1.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.1.1) - 2015-01-02
 - Added underscore.js, and re-wrote a few small pieces.

### [1.1.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.1.0) - 2014-12-17
 - Renamed show more/all to load more/all to better reflect what it really is.

### [1.0.1](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.0.1) - 2014-12-17
 - Fixed a small issue with which buttons are enabled/disabled on which pages.

### [1.0.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v1.0.0) - 2014-12-17
 - Fixed some issues with show more/all combined with changed orders. Fixed some issues with the
   changing of orders related to the year markers. Added buttons to show/hide all seen episodes.
   Added a 'sane mode' button, wh

### [0.3.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v0.3.0) - 2014-12-12
 - Moved the buttons to a menu on the side of the page. Added two buttons, one changing the order to
   the regular order, the other one changing the order to the reversed order.

### [0.2.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v0.2.0) - 2014-12-12
 - Added a 'Swap order' button next to the 'Show all' button. This reverses the order of the
   episodes, getting oldest first. Clicking it again will re-do this, essentially reversing it.
 - Update the namespace and update url.

### [0.1.0](https://github.com/MaienM/PocketcastsUtils/releases/tag/v0.1.0) - 2014-12-11
 - Initial version. This adds a 'Show all' button next to the 'Show more' button. This just keeps
   clicking 'Show more' until there is nothing more to show.
