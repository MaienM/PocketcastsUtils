// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/
// @version      1.7.1
// @description  Some utilities for pocketcasts
// @author       MaienM
// @match        https://play.pocketcasts.com/*
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @require      https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js
// ==/UserScript==

$(function() {
    // Get the MutationObserver class for this browser.
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    if (MutationObserver == null) {
        console.error("Your piece of shit browser does not support MutationObserver.");
        return;
    }
    
    /**
     * Check whether a value is nullish.
     */
    function isNull(value) {
        return value == null || value == undefined || value == '';
    }
    
    /**
     * Creating buttons/menus.
     */
    function createDropdown(cls, title, description, items) {
        var group = $('<div class="btn-group" role="group"><button type="button" class="btn btn-default dropdown-togggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon"></span><span class="caret"></span></button><ul class="dropdown-menu" role="menu"></ul></div>');
        var btn = $(group).find('button');
        var icon = $(btn).find('span.glyphicon');
        var menu = $(group).find('ul');
        $(group).data('cls', cls);
        $(group).data('title', title);
        $(group).data('description', description);
        $(btn).attr('aria-label', title);
        $(btn).dropdown();
        $(icon).addClass('glyphicon-' + cls);
        $(icon).after(' ' + title + ' ');
        $(icon).css('float', 'left');
        $(btn).attr('title', description);
        $(btn).find('span.caret').css('float', 'right').css('margin-top', '0.5em');
        $(menu).css('width', '100%').css('margin-top', '-1px');
        _.each(items, function(item) {
            // Get the data.
            var icls = item[0];
            var ititle = item[1];
            var idescription = item[2];
            var icallback = item[3];
            
            // Build the list item.
            var li = $('<li><a href="#"><span class="glyphicon"></span></a></li>');
            var a = $(li).find('a');
            var span = $(li).find('span');
            $(a).append(' ' + ititle);
            $(span).addClass('glyphicon-' + icls);
            $(li).attr('title', idescription);
            $(li).on('click', function(e) {
                e.preventDefault();
                icallback();
            });
            $(menu).append(li);
        });
        return group;
    }
    function createButton(cls, title, description, callback) {
        var btn = $('<button type="button" class="btn btn-default"></button>');
        var icon = $(btn).append('<span class="glyphicon" aria-hidden="true" style="float: left;"></span>');
        var titleElem = $(btn).append('<span class="title"></span>');
        setButton(btn, cls, title, description, callback);
        return btn;
    }
    function setButton(btn, cls, title, description, callback) {
        if (!isNull(cls)) {
            var icon = $(btn).find('.glyphicon');
            $(icon).attr('class', 'glyphicon');
            $(icon).addClass('glyphicon-' + cls);
            $(btn).data('cls', cls);
        }
        if (!isNull(title)) {
            var titleElem = $(btn).find('.title');
            $(btn).attr('aria-label', title);
            $(titleElem).html(title);
            $(btn).data('title', title);
        }
        if (!isNull(description)) {
            $(btn).attr('title', description);
            $(btn).data('description', description);
        }
        if (!isNull(callback)) {
            $(btn).on('click', callback);
            $(btn).data('callback', callback);
        }
        return btn;
    }
    function createStat(name, width) {
        if (width == undefined) {
            width = 'auto';
        }
        return '<stat id="stat-' + name + '" class="stat" style="width: ' + width + ';"></stat>';
    }
    function createEpisodeStats(name) {
        return createStat(name + '-count', '40px') + createStat(name + '-time');
    }
    
    // Multiline Function String - Nate Ferrero - Public Domain - http://stackoverflow.com/a/14496573
    function heredoc(f) {
        return f.toString().match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1];
    }
    
    // Helper method to call a callback, if given.
    function doCallback(callback) {
        if (typeof callback === 'function') {
            callback();
        }
    }

    /**
     * Styling.
     */
    // Add bootstrap.
    $('head').append($('<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">'));
    
    /**
     * Create a style.
     */
    function addStyle(content) {
        var style = $('<style></style>');
        $(style).html(content);
        $('head').append(style);
        return style;
    }
    
    /**
     * Enable/disable styles.
     */
    function setStyleState(style, state) {
        $(style)[0].disabled = !state;
    }
    
    /**
     * Tweaks to fix incompatibilities with bootstrap.
     * 
     * Also some core styles that need to be there no matter what.
     */
    var styleCore = addStyle(heredoc(function(){/*
        body {
            font-family: "proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif;
        }
        h1 {
            font-size: 24px;
        }
        h6.podcast_search {
            margin: 0;
        }
        .episodes_list h6 {
            margin: 0;
        }
        .stat {
            float: right;
            text-align: right;
            padding: 0 2px;
        }
        .stat:first-child {
            padding-right: 0;
        }
        #settings {
            width: 60%;
            height: 80%;
            text-align: left;
            padding: 0 2em;
            overflow-y: scroll;
        }
        #settings h2 .version {
            font-size: 75%;
            margin-left: 1em;
        }
        #settings h2 .version:before {
            content: 'v';
        }
        #settings .form-group {
            padding: 0 0.3em;
            position: relative;
        }
        #settings .form-group.new {
            background-color: lightgreen;
        }
        #settings .form-group.new:after {
            content: 'New!';
            position: absolute;
            top: 0.1em;
            right: 0em;
            font-size: 2.2em;
            color: red;
            background-color: inherit;
            width: 4em;
            text-align: right;
            padding-right: 0.5em;
        }
        #settings .form-group input + label {
            margin-left: 0.5em;
        }
        #settings .form-group .help-block {
            margin-top: -3px;
        }
        #settings .form-group .version {
            position: absolute;
            top: 0.3em;
            right: 0.2em;
            width: 6em;
            text-align: right;
        }
    */}));
    
    /**
     * Styling that makes the new settings more subtle.
     */
    var styleNewSubtle = addStyle(heredoc(function(){/*
        #settings .form-group.new {
            background-color: inherit;
        }
        #settings .form-group.new:after {
            font-size: 1em;
            top: auto;
            bottom: 0.1em;
        }
    */}));
    
    /**
     * Styling that hides the header.
     */
    var styleHeader = addStyle(heredoc(function(){/*
        #header {
            top: -66px;
        }
        #header:hover {
            top: 0;
            -webkit-animation: slidein 1s;
        }
        @-webkit-keyframes slidein {
            from {
                top: -66px;
            }
            to {
                top: 0;
            }
        }
        #main {
            padding-top: 4px;
        }
    */}));
    
    /**
     * Styling that makes the default menu buttons smaller.
     */
    var styleCompactMenu = addStyle(heredoc(function(){/*
        #content_left .episode_section {
            height: 41px;
        }
        #content_left .episode_section a {
            line-height: 41px !important;
        }
   */}));
    
    /**
     * Styling that makes the layout menu more compact, and which adds extra layouts.
     */
    var styleLayoutMenu = addStyle(heredoc(function(){/*
        .header > .grid_button,
        .header > .list_button {
            display: none;
        }
        .podcast_search {
            padding-right: 40px !important;
        }
        .podcast_search .clear_search {
            right: 46px !important;
        }
        #layouts {
            display: inline-block;
            position: absolute;
            top: 14px;
            right: 12px !important;
            cursor: pointer;
        }
        #layouts-menu {
            right: 0;
            left: auto;
            padding: 3px 5px 5px;
            min-width: 0;
            width: 90px;
        }
        #layouts-menu .button {
            display: inline-block;
            position: relative !important;
            top: 2px !important;
            right: auto !important;
            float: left;
            margin: 5px;
            cursor: pointer;
        }
        #layouts {
            width: 16px !important;
            height: 16px !important;
            background-size: 16px 16px !important;
        }
        #layouts-menu .button {
            width: 16px !important;
            height: 16px !important;
            background-size: 16px 16px !important;
        }
        .grid_button {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUQFgoGvGJOyAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALElEQVQ4y2OcPn36fwYkkJmZycjAwMBArDgTA4Vg4A0YeMA4GgujsTAoDAAAvnYgYi2ICugAAAAASUVORK5CYII=') !important;
        }            
        .grid_small_button {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUQFgouidfmMgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJ0lEQVQoz2OcPn36fwYoyMzMZCSFz8RAAaBIM0WAcdTPo34evH4GAH4/OyX5RctnAAAAAElFTkSuQmCC');
        }
        .grid_tiny_button {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUQFgo75AoC2QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJElEQVQoz2OcPn36fwYGBobMzExGUthMDPQGjKNOHXUqfZ0KAFuRXeSPp1AvAAAAAElFTkSuQmCC');
        }
        .list_button {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUQFg0BbUdNrAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAALUlEQVQ4y2OcPn36fwYkkJmZycjAwMCALo4LMDFQCAbegIEHjKOxMBoLg8IAAIUyFGKY/zqAAAAAAElFTkSuQmCC') !important;
        }            
        .list_small_button {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUQFg0bkCW01gAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAKElEQVQoz2OcPn36fwYoyMzMZETmEwJMDBQAijRTBBhH/Tzq58HrZwADDhslrH95HAAAAABJRU5ErkJggg==');
        }
        .list_tiny_button {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wUQFg05RUX1MgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJUlEQVQoz2OcPn36fwYGBobMzExGGJsYwMRAb8A46tRRp9LXqQAxwyHktYBY7AAAAABJRU5ErkJggg==');
        }
        #content_left > .grid.small .podcast {
            width: 25%;
        }
        #content_left > .grid.tiny .podcast {
            width: 20%;
        }
        #content_left > .list.small .podcast img {
            width: 50px;
            height: 50px;
        }
        #content_left > .list.small .podcast .podcast_text {
            width: 274px;
            height: 50px;
            padding: 8px 10px;
        }
        #content_left > .list.small .podcast .podcast_text .title,
        #content_left > .list.small .podcast .podcast_text .author {
            width: 238px;
            line-height: 18px;
        }
        #content_left > .list.tiny .podcast img {
            width: 25px;
            height: 25px;
        }
        #content_left > .list.tiny .podcast .podcast_text {
            width: 299px;
            height: 25px;
            padding: 5px 6px;
        }
        #content_left > .list.tiny .podcast .podcast_text .title {
            width: 238px;
            line-height: 18px;
        }
        #content_left > .list.tiny .podcast .podcast_text .author {
            display: none;
        }
    */}));
    
    /**
     * Do nothing.
     */
    function noop() {
    }
    
    /**
     * The basic load-more functionality.
     * 
     * Returns true if the action was successful.
     */
    function doLoadMore(callback) {
        doOrderRegular();
        
        // Get the load more button.
        var btnLoadMore = $('div.show_more:not(.show_all)');
        
        // If the button is visible, click it and assume that is successful.
        if ($(btnLoadMore).is(':visible')) {
            $(btnLoadMore).click();
            return true;
        }
        else {
            return false;
        }
        
        doOrderRestore();
        
        // Callback, if given.
        doCallback(callback);
    }
    
    /**
      * Load-all functionality.
      */
    function doLoadAll(callback) {
        // Every time the episodes list changes, check whether there is more still to load.
        var listObserver = new MutationObserver(function(mutations, observer) {
            if (!doLoadMore()) {
                // Stop listening to this event.
                listObserver.disconnect();
        
                // Callback, if given.
                doCallback(callback);
            }
        });
        listObserver.observe($('#podcast_show div.episodes_list')[0], {
            subtree: true,
            childList: true,
        });
        
        // Start loading more.
        if (!doLoadMore()) {
            doCallback(callback);
        }
    }
    
    /**
     * Changing the order.
     */
    var orderSwapped = false;
    var wasOrderSwapped = false;
    function doOrderSwap(callback) {
        // Get the div containing the episodes/headers.
        var container = $('#podcast_show .episodes_list');
        
        // Get the divs containing the years.
        var years = $('#podcast_show .episodes_list div.ng-scope');
        
        // Swap the order of the years.
        $(years).each(function() {
            $(container).prepend(this);
        });
        
        // Within each year, swap the order of the episodes.
        $(years).each(function() {        
            var year = this;
            
            // Get the episodes.
            var episodes = $(year).find('.episode_row');
            $($(episodes).get().reverse()).each(function() {
                $(year).append(this);
            });
        });
                      
        // Save the state.
        orderSwapped = !orderSwapped;
        
        // Callback, if given.
        doCallback(callback);
    }
    function doOrderRegular() {
        wasOrderSwapped = orderSwapped;
        if (orderSwapped) {
            doOrderSwap.apply(arguments);
        }
    }
    function doOrderInverse() {
        wasOrderSwapped = orderSwapped;
        if (!orderSwapped) {
            doOrderSwap.apply(arguments);
        }
    }
    function doOrderRestore() {
        if (wasOrderSwapped != orderSwapped) {
            doOrderSwap.apply(arguments);
        }
    }
    function doOrderReset(callback) {
        wasOrderSwapped = orderSwapped;
        orderSwapped = false;
        doCallback(callback);
    }
    
    /**
     * Show/hide seen episodes.
     */
    var SELECTOR_EPISODES = '.episode_row';
    var SELECTOR_STATUS_UNWATCHED = '.played_status_0, .played_status_1';
    var SELECTOR_STATUS_PARTIAL = '.played_status_2';
    var SELECTOR_STATUS_WATCHED = '.played_status_3';
    function doHide(elems, callback) {
        $(elems).hide();
        $(elems).last().show();
        
        // Callback, if given.
        doCallback(callback);
    }
    function doShow(elems, callback) {
        $(elems).show();
        
        // Callback, if given.
        doCallback(callback);
    }
    
    /**
     * Sane mode.
     */
    function doSaneMode(callback) {
        doLoadAll(function() {    
            doOrderInverse();
            doHide(SELECTOR_STATUS_WATCHED);
            
            // Callback, if given.
            doCallback(callback);
        });
    }
    
    /**
     * Parsing/formatting time.
     */
    var TIME_SECOND = 1;
    var TIME_MINUTE = 60 * TIME_SECOND;
    var TIME_HOUR = 60 * TIME_MINUTE;
    var TIME_DAY = 24 * TIME_HOUR;
    var TIME_WEEK = 7 * TIME_DAY;
    // Parse the time of all given elements, calculating the sum time.
    function timeCombine(elems) {
        var sum = 0;
        $(elems).each(function() {
            sum += $(this).scope().episode.duration;
        });
        return sum;
    }
    // Short format: HH:MM
    function timeFormatShort(num) {
        var hours = Math.floor(num / TIME_HOUR);
        var minutes = Math.floor((num % TIME_HOUR) / TIME_MINUTE);
        return hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    }
    // Long format: W weeks, D days, H hours, M minutes, S seconds
    function timeFormatFull(num) {
        var weeks = Math.floor(num / TIME_WEEK);
        var days = Math.floor((num % TIME_WEEK) / TIME_DAY);
        var hours = Math.floor((num % TIME_DAY) / TIME_HOUR);
        var minutes = Math.floor((num % TIME_HOUR) / TIME_MINUTE);
        var seconds = num % TIME_MINUTE;
        var parts = [
            weeks > 0 ? (weeks > 1 ? (weeks + ' weeks') : (weeks + ' week')) : '',
            days > 0 ? (days > 1 ? (days + ' days') : (days + ' day')) : '',
            hours > 0 ? (hours > 1 ? (hours + ' hours') : (hours + ' hour')) : '',
            minutes > 0 ? (minutes > 1 ? (minutes + ' minutes') : (minutes + ' minute')) : '',
            seconds > 0 ? (seconds > 1 ? (seconds + ' seconds') : (seconds + ' second')) : '',
        ];//*/
        return _.filter(parts).join(', ');
    }
            
    /**
     * Playlist mode.
     */
    var isPlaylistMode = false;
    var playlistPodcastController = null;
    function doPlaylistMode() {
        // Update the status/button.
        isPlaylistMode = !isPlaylistMode;
        updatePage();
            
        // Store the podcast controller.
        playlistPodcastController = podcastController;
    }
    function getNextEpisode() {
        var lastEpisode = $('#players').scope().mediaPlayer.episode;
        var lastEpisodeIndex = _.indexOf(playlistPodcastController.episodes, lastEpisode);
        return playlistPodcastController.episodes[lastEpisodeIndex - 1];
    }
    $('audio').on('play', updatePage);
    $('audio').on('ended', function() {
        // Playback is over, go to the next episode.
        if (isPlaylistMode) {
            // Play the next queued episode.
            var nextEpisode = getNextEpisode();
            var announcement = null;
            if (!isNull(nextEpisode)) {
                // Prepare an announcement for the episode.
                var announcement = new SpeechSynthesisUtterance('Next up: ' + nextEpisode.title);
                
                // Once the announcement is done, go to the next episode.
                announcement.onend = _.partial($('#podcast_show').scope().playPause, nextEpisode, playlistPodcastController.podcast);
            } else {
                // Prepare an announcement for end-of-playlist.
                var announcement = new SpeechSynthesisUtterance('End of queue');
                
                // Stop the playlist mode.
                isPlaylistMode = false;
                updatePage();
            }
            
            // Start the announcement.
            speechSynthesis.speak(announcement);
        }
    });
    
    /**
     * Create the menu.
     */
    var menu = $('<div class="btn-group-vertical actions"></div>');
    $(menu).css('width', '100%');
    $('div.header').after(menu);
    
    // Create the menu elements.
    var buttonSaneMode = createButton('user', 'Sane mode', 'Load everything, hide watched, order old -> new.', doSaneMode);
    var buttonPlaylistMode = createButton('play', 'Playlist mode', 'Auto-play the next episode.', doPlaylistMode);
    var buttonLoadMore = createButton('tag', 'Load more', 'Load more episodes.', doLoadMore);
    var buttonLoadAll = createButton('tags', 'Load all', 'Load all episodes.', doLoadAll);
    var dropShow = createDropdown('eye-open', 'Show/hide', 'Show/hide episodes', [
        ['eye-open', 'Show seen episodes', 'Show all seen episodes.', _.partial(doShow, SELECTOR_STATUS_WATCHED)],
        ['eye-close', 'Hide seen episodes', 'Hide all seen episodes.', _.partial(doHide, SELECTOR_STATUS_WATCHED)],
    ]);
    var dropOrder = createDropdown('sort', 'Order', 'Order episodes.', [
        ['sort-by-order', 'Order newest -> oldest', 'Order from newest to oldest.', doOrderRegular],
        ['sort-by-order-alt', 'Order oldest -> newest', 'Order from oldest to newest.', doOrderInverse],
    ]);
    var dropStats = createDropdown('info-sign', 'Information', 'Stats about the current podcast.', [
        ['', 'Total episodes:' + createEpisodeStats('total'), '', noop],
        ['', 'Watched:' + createEpisodeStats('watched'), '', noop],
        ['', 'Unwatched:' + createEpisodeStats('unwatched'), '', noop],
    ]);//*/
        
    // Add all elements to the menu.
    var menuItems = [
        buttonSaneMode,
        buttonPlaylistMode,
        buttonLoadMore,
        buttonLoadAll,
        dropShow,
        dropOrder,
        dropStats,
    ];   
    $(menu).append(menuItems);
        
    /**
     * Update the state of the menu items.
     */
    function setState(state, elems) {
        var btns = $(elems).map(function() { return this.toArray(); }).find('button').addBack().filter('button');
        if (state) {
            $(btns).removeClass('disabled');
        } else {
            $(btns).addClass('disabled');
        }
    }
        
    /**
     * Update the stats in the menu.
     */
    function setEpisodeStats(name, episodes) {
        $('#stat-' + name + '-count').text($(episodes).length);
        var time = timeCombine($(episodes));
        $('#stat-' + name + '-time').text(timeFormatShort(time));
        $('#stat-' + name + '-time').attr('title', timeFormatFull(time));        
    }

    /**
     * Watch the page for changes to enable/disable certain buttons at certain moments.
     */
    var prevPodcastController = null;
    var podcastController = null;
    function updatePage(mutations, observer) {
        // Determine the current state.
        prevPodcastController = podcastController;
        podcastController = $('#podcast_show').scope();
        var isPodcastPage = $('#podcast_show').is(':visible');
        var isDiscoverPage = $('#discover_container').is(':visible');
        var isPlaying = $('#players').is(':visible');
        var canLoadMore = $('.show_more').is(':visible');

        // Set the button states.
        setState(isPodcastPage, [buttonSaneMode, dropShow, dropOrder, dropStats]);
        setState((isPlaying && isPodcastPage) || isPlaylistMode, [buttonPlaylistMode]);
        setButton(buttonPlaylistMode, isPlaylistMode ? 'pause' : 'play', null, null);
        setState(isPodcastPage && canLoadMore, [buttonLoadMore, buttonLoadAll]);
        
        // Set the stats.
        setEpisodeStats('total', $(SELECTOR_EPISODES));
        setEpisodeStats('watched', $(SELECTOR_STATUS_WATCHED));
        setEpisodeStats('unwatched', $(SELECTOR_STATUS_UNWATCHED));
    
        // Load the shownotes of all episodes.
        $('.episode_row').each(function() {
            var episode = $(this).scope().episode;
            if (episode != null) {
                EpisodeHelper.loadShowNotes($, episode);
            }
        });
        
        // If a switch between podcasts is made, reset the order flag.
        if (podcastController != null && podcastController != prevPodcastController) {
            doOrderReset();
        }
    }
    var pageObserver = new MutationObserver(updatePage);
    pageObserver.observe($('#content_middle')[0], {
        subtree: true,
        childList: true,
    });

    /**
     * Search box.
     */
    var isSearchEnabled = true;
    var searchBox = $('.podcast_search input');
    var prevSearchValue = '';
    $(searchBox).on('change keyup paste', _.debounce(function() {
        if (!isSearchEnabled) {
            return;
        }
        
        // Get the search parameter.
        var searchValue = $(searchBox).val();
        var searchRegex = new RegExp(searchValue, 'i');
        var isSearch = searchValue != '';
        var isFirstSearch = isSearch && prevSearchValue == '';
        
        // If the value didn't change, don't bother.
        if (prevSearchValue == searchValue) {
            return;
        }
        prevSearchValue = searchValue;
        
        // Show/hide elements.
        $(SELECTOR_EPISODES).each(function() {
            // Save the visibility.
            if (isFirstSearch) {
                $(this).data('visible', $(this).is(':visible'));
            }
            
            // Show/hide element.
            var episode = $(this).scope().episode;
            if (isSearch ? (searchRegex.test(episode.title) || searchRegex.test(episode.show_notes)) : $(this).data('visible')) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }, 100));
    $('.clear_search').on('click', function() {
        $(searchBox).trigger('change');
    });
    
    /**
     * Layouts.
     */
    var layouts = [
        'grid', 'grid small', 'grid tiny',
        'list', 'list small', 'list tiny',
    ];
    var layoutButton = $('<div id="layouts" class="dropdown-toggle grid_button" data-toggle="dropdown" aria-expanded="false" aria-label="Layouts" title="Layouts"></div>');
    var layoutMenu = $('<ul id="layouts-menu" class="dropdown-menu" role="menu"></ul>');
    var podcastList = $('#content_left > .scrollable');
    $('.podcast_search').after(layoutButton).after(layoutMenu);
    _.each(layouts, function(layout) {
        var button = $('<span class="button ' + layout.replace(' ', '_') + '_button" title="' + layout + '"></span>');
        $(button).on('click', function(e) {
            $(layoutButton).removeClass(_.map(layouts, function(i) { return i.replace(' ', '_') + '_button'; }).join(' ')).addClass(layout.replace(' ', '_') + '_button');
            $(podcastList).removeClass(layouts.join(' ')).addClass(layout);
            GM_setValue('layout', layout);
            e.preventDefault();
        });
        if ($(podcastList).hasClass(layout.replace(' ', '_'))) {
            $(layoutButton).addClass(layout.replace(' ', '_') + '_button');
        }
        $(layoutMenu).append(button);
    });
    $(layoutMenu).find('.' + GM_getValue('layout', '').replace(' ', '_') + '_button').click();       
         
    /**
     * Settings.
     */
    // A version 'class'.
    function Version() {
        if (arguments.length > 1) {
            this.parts = arguments;
        } else if (_.isArray(arguments[0])) {
            this.parts = arguments[0];
        } else if (_.isUndefined(arguments[0])) {
            this.parts = [];
        } else {
            this.parts = _.chain((arguments[0] + '').split(',')).map(function(p) { return p.split('.'); }).flatten().map(function(p) { return +p; }).without(NaN).value();
        }
    }
    Version.prototype.toString = function() {
        // It's a bit of a weird string, but it's comparable, which is it's primary purpose.
        return _.map(this.parts, function(part) {
            return ('000' + part).substr(-3);
        }).toString();
    }
    Version.prototype.toUsefulString = function() {
        return this.parts.toString().replace(/,/g, '.');
    }
    
    // Whether to show the settings page when there is new stuff.
    isShowOnUpdateEnabled = true;
    
    // Define the settings.
    var settings = {
        self: {
            title: 'Pocketcast Utils Settings',
            description: 'Settings that affect the behavior of Pocketcast Utils only.',
            items: {
                showOnUpdate: {
                    title: 'Show on update',
                    description: 'Show this screen when there are new, exciting features.',
                    set: function(state) {
                        isShowOnUpdateEnabled = state;
                    },
                    version: [1, 6, 6],
                },
                newSubtle: {
                    title: 'More subtle new markings',
                    description: 'Make the markings showing which settings are new more subtle.',
                    set: _.partial(setStyleState, styleNewSubtle),
                    version: [1, 6, 6],
                    default: false,
                },
            },
        },
        tweaks: {
            title: 'Tweaks',
            description: 'Tweaks on default functionalities/page elements.',
            items: {
                header: {    
                    title: 'Hide the header',
                    description: 'Hide the default header, creating more screen space.',
                    set: _.partial(setStyleState, styleHeader),
                    version: [1, 5, 0],
                    default: false,
                },
                search: {
                    title: 'Episode search',
                    description: 'Let the search box also filter the currently loaded episodes\' titles and descriptions.',
                    set: function(state) {
                        isSearchEnabled = state;
                    },
                    version: [1, 3, 1],
                },
                layouts: {
                    title: 'Extra layouts',
                    description: 'Extra layouts for the podcast list in the sidebar.',
                    set: _.partial(setStyleState, styleLayoutMenu),
                    version: [1, 7, 0],
                },
            },
        },
        menu_default: {
            title: 'Default menu',
            description: 'Tweaks on the default menu.',
            items: {
                compact_menu: {
                    title: 'Compact',
                    description: 'Make the default menu buttons more compact.',
                    set: _.partial(setStyleState, styleCompactMenu),
                    version: [1, 6, 0],
                },
            },
        },
        menu_extra: {
            title: 'Extra menu',
            description: 'Tweaks on default functionalities/page elements.',
            items: {},
        },
    };
    _.each(['Discover', 'New Releases', 'In Progress'], function(name) {
        var key = name.toLowerCase().replace(' ', '_');
        var setting = {};
        var menuItem = $('.section_' + key);
        setting.title = name;
        setting.description = 'Show this menu button';
        setting.set = function(state) {
            if (state) {
                $(menuItem).show();
            } else {
                $(menuItem).hide();
            }
        };
        setting.version = [1, 6, 4];
        settings.menu_default.items[key] = setting;
    });
    menuItems = [
        [buttonSaneMode, [1, 0, 0], true],
        [buttonPlaylistMode, [1, 4, 0], true], 
        [buttonLoadMore, [0, 2, 0], false],
        [buttonLoadAll, [0, 2, 0], false],
        [dropShow, [1, 1, 0], false],
        [dropOrder, [0, 3, 0], false],
        [dropStats, [1, 2, 0], true],
    ];   
    _.each(menuItems, function(menuItem) {
        var key = $(menuItem[0]).data('cls');
        var setting = {};
        setting.title = $(menuItem[0]).data('title');
        setting.description = 'Show this menu button (function: ' + $(menuItem[0]).data('description') + ')';
        setting.set = function(state) {
            if (state) {
                $(menuItem[0]).show();
            } else {
                $(menuItem[0]).hide();
            }
        };
        setting.version = menuItem[1];
        setting.default = menuItem[2];
        settings.menu_extra.items[key] = setting;
    });
    
    // Get the previous version.
    var prevVersion = new Version(GM_getValue('version'));
    GM_setValue('version', GM_info.script.version);
    
    // Build the settings page.
    var settingsContainer = $('<div id="settings-container" class="dialog_page"></div>');
    $(settingsContainer).hide();
    var settingsDiv = $('<div id="settings" class="dialog_panel"><h2>Pocketcast Utils</h2></div>');
    $(settingsDiv).find('h2').append('<span class="version">' + GM_info.script.version + '</span>');
    $(settingsDiv).append(heredoc(function(){/*
        <p>
        Pocketcast Utils is a Tampermonkey Script that aims to enhance the default Pocketcast interface and experience. 
        It does this by both adding new, and streamlining existing functionality and interfaces.
        </p><p>
        Of course, this should never result in degrading the overal experience. 
        Therefore, you can choose to enable or disable any of it's features as you please.
        These changes take effect immediately; you can see their result in the background.
        By default, certain options will be enabled/disabled, to showcase the main features without getting in the way and overwhelming you.
        </p><p>
        This screen will automatically open when new options are added (unless you don't want it to), and those options will then be highlighted.
        Additionally, this screen can be found under the cog in the top right corner (which, incidentally, is the only thing you cannot turn off).
        It's the 'Utils Settings' item from the dropdown menu.
        </p>
        <a id="resetSettings">Reset all settings to default</a>
    */}));
    $(settingsContainer).append(settingsDiv);
    $(settingsDiv).find('#resetSettings').on('click', function() {
        if (confirm('Are you sure you want to reset all settings to default? There is no way to undo this!')) {
            _.each(GM_listValues(), GM_deleteValue);
            GM_setValue('version', GM_info.script.version);
        }
    });
    $('body').append(settingsContainer);
    _.each(_.pairs(settings), function(pair) {
        var key = 'setting-' + pair[0];
        var group = pair[1];
        
        // Create a group header.
        $(settingsDiv).append('<h3>' + group.title + '</h3>');
        
        _.each(_.pairs(group.items), function(pair) {
            var key = 'setting-' + pair[0];
            var setting = _.defaults(pair[1], {
                default: true,
            });
        
            // Create the checkbox.
            var checkbox = $('<input id="' + key + '" type="checkbox" />');
            $(checkbox).on('change', function() {
                GM_setValue(key, $(this).is(':checked'));
            });
            
            // List to changes of the setting.
            GM_addValueChangeListener(key, function(name, old_value, new_value, remote) {
                value = GM_getValue(key, setting.default);
                setting.set(value);
                if ($(checkbox).is(':checked') != value) {
                    $(checkbox).click();
                }
            });
            
            // Load the setting.
            var value = GM_getValue(key, setting.default);
            if (value) {
                $(checkbox).click();
            }
            setting.set(value);
            
            // Get the version.
            var version = new Version(setting.version);
            
            // Create the form group.
            var group = $('<div class="form-group"></div>');
            $(group).append(checkbox);
            $(group).append('<label for="' + key + '">' + setting.title + '</label>');
            $(group).append('<p class="help-block version">Since v' + version.toUsefulString() + '</label>');
            $(group).append('<p class="help-block">' + setting.description + '</p>');
            $(settingsDiv).append(group);
            
            // Mark the block as new, if the setting has been added since your previous version.
            if (version > prevVersion) {
                $(group).addClass('new');
            }
        });
    });

    // Show/hide the settings container.
    var settingsItem = $('<li><a>Utils Settings</a></li>');
    $('#header .dropdown-menu .divider').last().after('<li class="divider"></li>').after(settingsItem);
    $(settingsItem).on('click', function() {
        $(settingsContainer).show();
    });
    $(settingsContainer).on('click', function() {
        $(settingsContainer).hide();
    });
    $(settingsDiv).on('click', function(e) {
        e.stopPropagation();
    });

    // If there is anything new, show the settings.
    if ($(settingsDiv).find('.new').length > 0 && isShowOnUpdateEnabled) {
        $(settingsContainer).show();
    }
});