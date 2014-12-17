// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/
// @version      1.0
// @description  Some utilities for pocketcasts
// @author       MaienM
// @match        https://play.pocketcasts.com/*
// @grant        none
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
    $(items).each(function() {
        // Get the data.
        var icls = this[0];
        var idescription = this[1];
        var icallback = this[2];
        
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
    $('body').css('font-family', '"proxima-nova","Helvetica Neue",Helvetica,Arial,sans-serif');
    $('h1').css('font-size', '24px');
    $('h6.podcast_search').css('margin', '0');
    
    /**
     * The basic show-more functionality.
     * 
     * Returns true if the action was successful.
     */
    function doShowMore(callback) {
        doOrderRegular();
        
        // Get the show more button.
        var btnShowMore = $('div.show_more:not(.show_all)');
        
        // If the button is visible, click it and assume that is successful.
        if ($(btnShowMore).is(':visible')) {
            $(btnShowMore).click();
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
            $(episodes).each(function() {
                $(year).prepend(this);
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
 	 * Show-all functionality.
 	 */
    function doShowAll(callback) {
        // Every time the episodes list changes, check whether there is more still to show.
        var listObserver = new MutationObserver(function(mutations, observer) {
            if (!doShowMore()) {
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
        
        // Start showing more.
        doShowMore();
    }
    
    /**
     * Show/hide seen episodes.
     */
    function doHideSeen(callback) {
        $('.played_status_3').hide();
        
        // Callback, if given.
        doCallback(callback);
    }
    function doShowSeen(callback) {
        $('.played_status_3').show();
        
        // Callback, if given.
        doCallback(callback);
    }
    
    /**
     * Sane mode.
     */
    function doSaneMode(callback) {
        doShowAll(function() {    
        	doOrderInverse();
            doHideSeen();
            
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
    var iconShowMore = createIcon('tag', 'Show more', doShowMore);
    var iconShowAll = createIcon('tags', 'Show all', doShowAll);
    var dropOrder = createDropdown('sort', 'Order', [
    	['sort', 'Swap order', doOrderSwap],
        ['sort-by-order', 'Order newest -> oldest', doOrderRegular],
        ['sort-by-order-alt', 'Order oldest -> newest', doOrderInverse],
    ]);//*/
        
    // Add all elements to the proper location.
    $('div.header').after(menu);
    $(menu).append(iconSaneMode);
    $(menu).append(iconShowMore);
    $(menu).append(iconShowAll);
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
    var showObserver = new MutationObserver(function(mutations, observer) {
        setState($(mutations[0].target).is(':visible'), [iconShowMore, iconShowAll]);
    });
    var pageObserver = new MutationObserver(function(mutations, observer) {
        // Determine the current page.
        prevPodcastID = podcastID;
        podcastID = $('#podcast_header_text h1').text();
        var isPodcastPage = $('#podcast_show').is(':visible');

        // Set the order buttons.
        setState(isPodcastPage, [iconShowMore, iconShowAll, dropOrder]);
        
        // Watch the show button.
        if (isPodcastPage) {
            // Set current state.
            var btnShowMore = $('.show_more');
            setState($(btnShowMore).is(':visible'), [iconShowMore, iconShowAll]);

            // Watch.
            if ($(btnShowMore).is(':visible')) {
                showObserver.observe(btnShowMore[0], {
                    attributes: true,
                });	
            } else {
                showObserver.disconnect();
            }
        } else {
            showObserver.disconnect();
        }
        
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