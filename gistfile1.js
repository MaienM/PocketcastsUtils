// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://gist.github.com/MaienM/e477e0f4e8ec3c1836a7/raw/25712be7ef9e7008549b4e0aa9dff7bb3871f1fc/gistfile1.js
// @updateURL    https://gist.githubusercontent.com/MaienM/e477e0f4e8ec3c1836a7/raw/25712be7ef9e7008549b4e0aa9dff7bb3871f1fc/gistfile1.js
// @version      0.1
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
 * Add a show-all button next to the show-more button.
 */
    
    // Create the button.
    var showAll = $('<div class="show_all show_more">Show all</div>');
    
    // Handle it's click.
    $(showAll).on('click', function() {
        var showMore = $('div.show_more:not(.show_all)');
        
        // Every time the episodes list changes, click show more if there is still more to show.
        var listObserver = new MutationObserver(function(mutations, observer) {
            if ($(showMore).is(':visible')) {
                $(showMore).click();
            } else {
            	listObserver.disconnect();
            }
        });
        listObserver.observe($('#podcast_show div.episodes_list')[0], {
            subtree: true,
            childList: true,
        });
        
        // Click it once to start.
        $(showMore).click();
    });
    
    // When needed, add it to the page.
    var pageObserver = new MutationObserver(function(mutations, observer) {
        var showMore = $('.show_more');
        if ($(showMore).length > 0 && $('.show_all').length == 0) {
            // Add the button.
            $(showMore).after(showAll);
            
            // When the more button's visiblity changes, update the visibility of the all button as well.
            var showObserver = new MutationObserver(function(mutations, observer) {
                if ($(showMore).is(':visible')) {
                    $(showAll).show();
                } else {
                    $(showAll).hide();
                }
            });
            showObserver.observe(showMore[0], {
                attributes: true,
            });
        }
    });
    pageObserver.observe($('#content_middle')[0], {
        subtree: true,
        childList: true,
    });
});
