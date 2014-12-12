// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7/raw/25712be7ef9e7008549b4e0aa9dff7bb3871f1fc/gistfile1.js
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/25712be7ef9e7008549b4e0aa9dff7bb3871f1fc/gistfile1.js
// @version      0.2
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

$(function() {
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
    function doSwapOrder() {
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
    
    // Create the button.
    var btnSwapOrder = $('<div class="swap_order show_more">Swap order</div>');
	$(btnSwapOrder).on('click', doSwapOrder);
    
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
    
    // Create the button.
    var btnShowAll = $('<div class="show_all show_more">Show all</div>');
    $(btnShowAll).on('click', doShowAll);
    
    /**
     * Add the buttons to the page when needed.
     */
    var pageObserver = new MutationObserver(function(mutations, observer) {
        // Get the show more button.
        var btnShowMore = $('.show_more');
        if ($(btnShowMore).length > 0 && $('.show_all').length == 0) {
            // Add the buttons.
            $(btnShowMore).after(btnSwapOrder);
            $(btnShowMore).after(btnShowAll);
            
            // When the more button's visiblity changes, update the visibility of the all button as well.
            var showObserver = new MutationObserver(function(mutations, observer) {
                if ($(btnShowMore).is(':visible')) {
                    $(btnShowAll).show();
                } else {
                    $(btnShowAll).hide();
                }
            });
            showObserver.observe(btnShowMore[0], {
                attributes: true,
            });
        }
    });
    pageObserver.observe($('#content_middle')[0], {
        subtree: true,
        childList: true,
    });
});
