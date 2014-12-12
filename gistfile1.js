// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/
// @version      0.3
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

// Function to create a button.
function createIcon(cls, description, callback) {
    var btn = $('<div><i></i></div>');
    var i = $(btn).find('i');
    $(i).addClass('fa fa-lg fa-' + cls);
    $(i).css('margin: 0 auto');
    $(btn).css('display', 'inline-block');
    $(btn).css('margin', '8px 0 5px 5px');
    $(btn).css('min-width', '27px');
    $(btn).css('min-height', '27px');
    $(btn).css('border', '1px solid gray');
    $(btn).attr('title', description);
    $(btn).on('click', callback);
    return btn;
}

$(function() {
    // Add the fontawesome css to the header.
    $('head').append($('<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">'));
    
    /*
     * The basic show-more functionality.
     * 
     * Returns true if the action was successful.
     */
    function doShowMore() {
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
    }
    
    /*
     * Add a swap-order button.
     */
       
    // Function to swap the order.
    var orderSwapped = false;
    function doOrderSwap() {
        // Get the div containing the episodes/headers.
        var container = $('#podcast_show .episodes_list > div:first');
        
        // Get the stuff that should be swapped.
        var toSwap = $(container).find('> *');
        
        // Remove it from the container.
        $(toSwap).remove();
        
        // Add them back in reverse order.
        $(toSwap).each(function() {
            $(container).prepend(this);
        });
        
        // Save the state.
        orderSwapped = !orderSwapped;
    }
    function doOrderRegular() {
        if (orderSwapped) {
            doOrderSwap();
        }
    }
    function doOrderInverse() {
        if (!orderSwapped) {
            doOrderSwap();
        }
    }
    
	/*
 	 * Add a show-all button next to the show-more button.
 	 */
    
    // Function to show all.
    function doShowAll() {
        // Every time the episodes list changes, check whether there is more still to show.
        var listObserver = new MutationObserver(function(mutations, observer) {
            if (!doShowMore()) {
                // Stop listening to this event.
                listObserver.disconnect();
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
     * Create buttons for all functions.
     */
    var iconOrderSwap = createIcon('sort', 'Swap order', doOrderSwap);
    var iconOrderRegular = createIcon('sort-numeric-desc', 'Order newest -> oldest', doOrderRegular);
    var iconOrderInverse = createIcon('sort-numeric-asc', 'Order oldest -> newest', doOrderInverse);
    var iconShowMore = createIcon('', 'Show more', doShowMore);
    var iconShowAll = createIcon('', 'Show all', doShowAll);
    
    /**
     * Add the buttons to the page when needed.
     */
    var showObserver = null;
    var pageObserver = new MutationObserver(function(mutations, observer) {
        // If the icon bar already exists, don't bother.
        if ($('div.actions').length > 0) {
            return;
        }
        
        // Build an icon bar and put it below the image.
        var container = $('<div></div>');
        $(container).addClass('actions');
        $('#podcast_header_image').append(container);
        
        // Add the icons.
        $(container).append(iconOrderSwap);
        $(container).append(iconOrderRegular);
        $(container).append(iconOrderInverse);
        $(container).append(iconShowMore);
        $(container).append(iconShowAll);
        
        // Get the show more button.
        var btnShowMore = $('.show_more');
            
        // When the more button's visiblity changes, update the visibility of the associated buttons as well.
        if (showObserver != null) {
            showObserver.disconnect();
        }
        showObserver = new MutationObserver(function(mutations, observer) {
            if ($(btnShowMore).is(':visible')) {
                $(iconShowMore).show();
                $(iconShowAll).show();
            } else {
                $(iconShowMore).hide();
                $(iconShowAll).hide();
            }
        });
        showObserver.observe(btnShowMore[0], {
            attributes: true,
        });
    });
    pageObserver.observe($('#content_middle')[0], {
        subtree: true,
        childList: true,
    });
});