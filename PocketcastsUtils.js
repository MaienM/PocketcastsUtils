// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/
// @version      1.1.2
// @description  Some utilities for pocketcasts
// @author       MaienM
// @match        https://play.pocketcasts.com/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js
// ==/UserScript==

// Get the MutationObserver class for this browser.
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
if (MutationObserver == null) {
    console.error("Your piece of shit browser does not support MutationObserver.");
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
function createIcon(cls, description, callback) {
    var btn = $('<button type="button" class="btn btn-default"><span class="glyphicon" aria-hidden="true"></span></button>');
    var icon = $(btn).find('span');
    $(btn).attr('aria-label', description);
    $(icon).addClass('glyphicon-' + cls);    
    $(icon).after(' ' + description);
    $(icon).css('float', 'left');
    if (callback != undefined) {
    	$(btn).on('click', callback);
    }
    return btn;
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

$(function() {
    /**
     * Styling.
     */
    // Add bootstrap.
    $('head').append($('<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">'));
    $('head').append($('<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js" type="text/javascript">'));
    
    // Add some custom tweaks to fix minor issues caused by bootstrap.
    var style = $('<style></style>');
    $(style).html(heredoc(function(){/*
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
   */}));
    $('head').append(style);
    
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
    var STATUS_UNWATCHED = '.played_status_1';
    var STATUS_PARTIAL = '.played_status_2';
    var STATUS_WATCHED = '.played_status_3';
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
            doHide(STATUS_WATCHED);
            
            // Callback, if given.
            doCallback(callback);
        });
    }
    
    /**
     * Create the menu.
     */
    var menu = $('<div class="btn-group-vertical actions"></div>');
    $(menu).css('width', '100%');
    
    // Create the menu elements.
    var iconSaneMode = createIcon('user', 'Sane mode', doSaneMode);
    var iconLoadMore = createIcon('tag', 'Load more', doLoadMore);
    var iconLoadAll = createIcon('tags', 'Load all', doLoadAll);
    var dropShow = createDropdown('eye-open', 'Show/hide', [
        ['eye-open', 'Show seen episodes', _.partial(doShow, STATUS_WATCHED)],
        ['eye-close', 'Hide seen episodes', _.partial(doHide, STATUS_WATCHED)]
    ]);
    var dropOrder = createDropdown('sort', 'Order', [
        ['sort-by-order', 'Order newest -> oldest', doOrderRegular],
        ['sort-by-order-alt', 'Order oldest -> newest', doOrderInverse]
    ]);//*/
	
    // Add all elements to the proper location.
    $('div.header').after(menu);
    $(menu).append(iconSaneMode);
    $(menu).append(iconLoadMore);
    $(menu).append(iconLoadAll);
    $(menu).append(dropShow);
    $(menu).append(dropOrder);
    
    /**
     * Watch the page for changes to enable/disable certain buttons at certain moments.
     */
    function setState(state, elems) {
        var btns = $(elems).map(function() { return this.toArray(); }).find('button').addBack().filter('button');
        if (state) {
        	$(btns).removeClass('disabled');
        } else {
            $(btns).addClass('disabled');
        }
    }
    // When the more button's visiblity changes, update the visibility of the associated buttons as well.
    var prevPodcastID = null;
    var podcastID = null;
    var pageObserver = new MutationObserver(function(mutations, observer) {
        // Determine the current state.
        prevPodcastID = podcastID;
        podcastID = $('#podcast_header_text h1').text();
        var isPodcastPage = $('#podcast_show').is(':visible');
        var canLoadMore = $('.show_more').is(':visible');

        // Set the button states.
        setState(isPodcastPage, [iconSaneMode, dropShow, dropOrder]);
        setState(isPodcastPage && canLoadMore, [iconLoadMore, iconLoadAll]);
        
        // If a switch between podcasts is made, reset the order flag.
        if (podcastID != null && podcastID != prevPodcastID) {
            doOrderReset();
        }
    });
    pageObserver.observe($('#content_middle')[0], {
        subtree: true,
        childList: true,
    });
});
