// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/
// @version      1.6.0
// @description  Some utilities for pocketcasts
// @author       MaienM
// @match        https://play.pocketcasts.com/*
// @grant		 GM_setValue
// @grant		 GM_getValue
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
    function createDropdown(cls, description, items) {
        var group = $('<div class="btn-group" role="group"><button type="button" class="btn btn-default dropdown-togggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon"></span><span class="caret"></span></button><ul class="dropdown-menu" role="menu"></ul></div>');
        var btn = $(group).find('button');
        var icon = $(btn).find('span.glyphicon');
        var menu = $(group).find('ul');
        $(btn).attr('aria-label', description);
        $(btn).dropdown();
        $(icon).addClass('glyphicon-' + cls);
        $(icon).after(' ' + description + ' ');
        $(icon).css('float', 'left');
        $(btn).find('span.caret').css('float', 'right').css('margin-top', '0.5em');
        $(menu).css('width', '100%').css('margin-top', '-1px');
        _.each(items, function(item) {
            // Get the data.
            var icls = item[0];
            var idescription = item[1];
            var icallback = item[2];
            
            // Build the list item.
            var li = $('<li><a href="#"><span class="glyphicon"></span></a></li>');
            var a = $(li).find('a');
            var span = $(li).find('span');
            $(a).append(' ' + idescription);
            $(span).addClass('glyphicon-' + icls);
            $(li).on('click', function(e) {
                e.preventDefault();
                icallback();
            });
            $(menu).append(li);
        });
        return group;
    }
    function createButton(cls, description, callback) {
        var btn = $('<button type="button" class="btn btn-default"></button>');
        var icon = $(btn).append('<span class="glyphicon" aria-hidden="true" style="float: left;"></span>');
        var desc = $(btn).append('<span class="description"></span>');
        setButton(btn, cls, description, callback);
        return btn;
    }
    function setButton(btn, cls, description, callback) {
        if (!isNull(cls)) {
            var icon = $(btn).find('.glyphicon');
            $(icon).attr('class', 'glyphicon');
            $(icon).addClass('glyphicon-' + cls);
        }
        if (!isNull(description)) {
            var desc = $(btn).find('.description');
            $(btn).attr('aria-label', description);
            $(desc).html(description);
        }
        if (!isNull(callback)) {
            $(btn).on('click', callback);
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
    $('head').append($('<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js" type="text/javascript">'));
    
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
        #settings-container {
        	position: absolute;
            top: 0;
            left: 0;
        	width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10;
        }
        #settings {
        	position: absolute;
        	width: 60%;
            height: 80%;
            top: 10%;
            left: 20%;
            background-color: white;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 0 2em;
        }
        #settings .close {
        	position: absolute;
            right: 0;
            top: 0;
            padding: 10px;
            border: 1px solid #333;
            border-width: 0 0 1px 1px;
            border-bottom-left-radius: 5px;
        }
        #settings input + label {
        	margin-left: 0.5em;
        }
        #settings .help-block {
        	margin-top: -3px;
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
    var isPlaylistMode = false
    var playlistPodcastController = null;
    var playlistNextEpisode = null
    function doPlaylistMode() {
        // Update the status/button.
        isPlaylistMode = !isPlaylistMode;
        updatePage();
            
        // Determine the next episode.
        playlistPodcastController = podcastController;
        updateNextEpisode();
    }
    function updateNextEpisode() {
        var lastEpisode = $('#players').scope().mediaPlayer.episode;
        playlistNextEpisode = playlistPodcastController.episodes[_.indexOf(playlistPodcastController.episodes, lastEpisode) - 1];
    }
    var playerObserver = new MutationObserver(function(mutations, observer) {
        // Playback is over, go to the next episode.
        if (isPlaylistMode && !$('#players').is(':visible')) {
            // Play the next queued episode.
            var announcement = null;
            if (!isNull(playlistNextEpisode)) {
                // Prepare an announcement for the episode.
                var announcement = new SpeechSynthesisUtterance('Next up: ' + playlistNextEpisode.title);
                
                // Once the announcement is done, go to the next episode.
                announcement.onend = _.partial($('#podcast_show').scope().playPause, playlistNextEpisode, playlistPodcastController.podcast);
            } else {
                // Prepare an announcement for the episode.
                var announcement = new SpeechSynthesisUtterance('End of queue');
            }
            
            // Start the announcement.
            speechSynthesis.speak(announcement);
            
            // Determine the next episode.
            updateNextEpisode();
            if (isNull(playlistNextEpisode)) {
                isPlaylistMode = false;
            }
        }
        
        // Update the page.
        updatePage();
    });
    playerObserver.observe($('#players')[0], {
        attributes: true
    });
    
    /**
     * Create the menu.
     */
    var menu = $('<div class="btn-group-vertical actions"></div>');
    $(menu).css('width', '100%');
    
    // Create the menu elements.
    var buttonSaneMode = createButton('user', 'Sane mode', doSaneMode);
    var buttonPlaylistMode = createButton('play', 'Playlist mode', doPlaylistMode);
    var buttonLoadMore = createButton('tag', 'Load more', doLoadMore);
    var buttonLoadAll = createButton('tags', 'Load all', doLoadAll);
    var dropShow = createDropdown('eye-open', 'Show/hide', [
        ['eye-open', 'Show seen episodes', _.partial(doShow, SELECTOR_STATUS_WATCHED)],
        ['eye-close', 'Hide seen episodes', _.partial(doHide, SELECTOR_STATUS_WATCHED)],
    ]);
    var dropOrder = createDropdown('sort', 'Order', [
        ['sort-by-order', 'Order newest -> oldest', doOrderRegular],
        ['sort-by-order-alt', 'Order oldest -> newest', doOrderInverse],
    ]);
    var dropStats = createDropdown('info-sign', 'Information', [
        ['', 'Total episodes:' + createEpisodeStats('total'), noop],
        ['', 'Watched:' + createEpisodeStats('watched'), noop],
        ['', 'Unwatched:' + createEpisodeStats('unwatched'), noop],
    ]);//*/
        
    // Add all elements to the proper location.
    $('div.header').after(menu);
    $(menu).append(buttonSaneMode);
    $(menu).append(buttonPlaylistMode);
    $(menu).append(buttonLoadMore);
    $(menu).append(buttonLoadAll);
    $(menu).append(dropShow);
    $(menu).append(dropOrder);
    $(menu).append(dropStats);
        
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
    var searchBox = $('.podcast_search input');
    var prevSearchValue = '';
    $(searchBox).on('change keyup paste', _.debounce(function() {
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
     * Settings.
     */
	// Define the settings.
    var settings = {
        'header': {
            'title': 'Hide the header',
            'description': 'Hide the default header, creating more screen space.',
            'set': _.partial(setStyleState, styleHeader),
            'default': true,
        },
        'compact_menu': {
            'title': 'Compact menu',
            'description': 'Make the default menu buttons more compact.',
            'set': _.partial(setStyleState, styleCompactMenu),
            'default': true,
        }
	}
    
    // Build the settings page.
    var settingsContainer = $('<div id="settings-container"></div>');
	var settingsDiv = $('<div id="settings"><h2>Settings</h2></div>');
	var settingsCloseButton = $('<span class="close glyphicon glyphicon-remove"></span>');
	$(settingsContainer).append(settingsDiv);
	$(settingsDiv).append(settingsCloseButton);
	$('body').append(settingsContainer);
    _.each(_.pairs(settings), function(pair) {
        var key = 'setting-' + pair[0];
        var settings = pair[1];
        
        // Create the checkbox.
        var checkbox = $('<input id="' + key + '" type="checkbox" />');
        $(checkbox).on('change', function() {
            var value = $(this).is(':checked');
            GM_setValue(key, value);
            settings.set(value);
        });
        
        // Load the setting.
        var value = GM_getValue(key, settings.default);
        if (value) {
            $(checkbox).click();
        }
        settings.set(value);
        
        // Create the form group.
        var group = $('<div class="form-group"></div>');
        $(group).append(checkbox);
        $(group).append('<label for="' + key + '">' + settings.title + '</label>');
        $(group).append('<p class="help-block">' + settings.description + '</p>');
        $(settingsDiv).append(group);
    });

	// Show/hide the settings container.
    $('.settings_cog').on('click', function() {
        $(settingsContainer).show();
    });
    $(settingsCloseButton).on('click', function() {
        $(settingsContainer).hide();
    });
    $(settingsContainer).on('click', function() {
        $(settingsContainer).hide();
    });
	$(settingsDiv).on('click', function(e) {
        e.stopPropagation();
    });
});