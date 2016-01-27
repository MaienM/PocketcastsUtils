###
Watching the page for changes, tracking it's state.
###

# Get the MutationObserver class for this browser.
MutationObserver = window.MutationObserver || window.WebKitMutationObserver

# The pages that the user can be on.
Page =
    # The discover page, from the menu.
    DISCOVER: 1

    # The new releases page, from the menu.
    NEW_RELEASES: 2

    # The in progress page, from the menu.
    IN_PROGRESS: 3

    # The starred page, from the menu.
    STARRED: 4

    # The page of a podcast.
    PODCAST: 5

    # Unknown page. Should never happen, but hey, future proof/defensive programming!
    UNKNOWN: 6

# The episode categories to select.
EpisodeSelector =
    # jQuery selector matching all episodes.
    All: '.episode_row'

    # jQuery selector matching all unwatched episodes. 0 is unwatched, 1 is marked as unwatched.
    Unwatched: '.played_status_0, .played_status_1'

    # jQuery selector matching all episodes that are in progress.
    Partial: '.played_status_2'

    # jQuery selector matching all watched episodes. 3 is watched, 4 is marked as watched.
    Watched: '.played_status_3, .played_status_4'

# The episode orders.
EpisodeOrder =
    # Constant for date new -> old ordering.
    DateNewOld: 'DATE_NEW_OLD'

    # Constant for date old -> new ordering.
    DateOldNew: 'DATE_OLD_NEW'

# Interaction layer between us and the page.
#
# This class is responsible for keeping track of the state of the Pocketcasts page, and for us manipulating the page.
#
# This class contains several so-called "scopes", which are the native Pocketcasts objects bound to several page
# elements.
class PageController
    # The main scope.
    mainScope: null

    # The player scope.
    playerScope: null

    # The podcast scope, if any.
    podcastScope: null

    # The player episode, if any.
    playerEpisodeData: null

    # The player episode's podcast scope, if any.
    playerEpisodePodcastData: null

    # The current page.
    page: Page.UNKNOWN

    # Whether all episodes for the current podcast are loaded.
    #
    # If @page != Page.PODCAST, this will be undefined
    podcastFullyLoaded: undefined

    # Create a new page observer.
    constructor: () ->

    # Attach the controller to the page.
    inject: () ->
        # Get scopes.
        @mainScope = $('#main').scope()
        @playerScope = $('#players').scope()

        # Bind to events.
        # Using the MutationObserver is preferable, as it only triggers when something changes, but we can fallback to
        # an angular watch, which seems to fire... well, a lot. For no discernable reason.
        rescan = _.bind(@rescan, this)
        if MutationObserver?
            pageObserver = new MutationObserver(rescan)
            pageObserver.observe($('#content_middle')[0], {
                subtree: true
                childList: true
                attributes: true
            })
        else
            $(@mainScope).$watch(rescan)

    # Update the state by re-observing the page.
    #
    # There should be no need to call this manually, as changes to the page should automatically trigger
    #
    # Once the status has been updated, a 'change' event will be raised.
    rescan: () ->
        # Determine the current podcast.
        @podcastScope = $('#podcast_show').scope()

        # Determine the current page.
        @page = switch
            when @mainScope.isSectionDiscover() then Page.DISCOVER
            when @mainScope.isSectionNewReleases() then Page.NEW_RELEASES
            when @mainScope.isSectionInProgress() then Page.IN_PROGRESS
            when @mainScope.isSectionStarred() then Page.STARRED
            when @podcastScope? then Page.PODCAST
            else Page.UNKNOWN

        # Determine the current episode state.
        @playerEpisodeData = @playerScope.mediaPlayer.episode
        @playerEpisodePodcastData = @playerScope.mediaPlayer.podcast
        if @playerEpisodePodcastData?
            if @podcastScope.podcast.uuid == @playerEpisodePodcastData.uuid
                @playerEpisodePodcastScope = @podcastScope
        else
            @playerEpisodePodcastScope = null

        # Determine the current podcast page state.
        @podcastFullyLoaded = undefined
        @podcastFullyLoaded = @podcastScope.episodes.length == @podcastScope.episodesTotal if @podcastScope?

        # Fire off the event, if anything changed
        $(this).trigger('change', this)

    # Hide all elements from the given list/matching the given selector, except for
    # the last one.
    #
    # @param elems The elements/selector to hide.
    hideEpisodes: (elems) ->
        $(elems).hide()
        $(elems).last().show()

    # Show all elements from the given list/matching the given selector.
    #
    # @param elems The elements/selector to show.
    showEpisodes: (elems) ->
        $(elems).show()

    # Load more episodes for the current podcast.
    #
    # @param callback  [Function]  The function that will be called once more episodes have been loaded.
    # @return          [Element]   Whether more episodes are being loaded.
    loadMore: (callback) ->
        # If there are no more episodes to load, return false and do nothing.
        return false if @podcastFullyLoaded

        # Listen to changes to determine when the loading is done.
        currentlyLoaded = @podcastScope.episodes.length
        listener = () ->
            if @podcastScope.episodes.length > currentlyLoaded
                $(this).unbind(listener)
            Utils.doCallback(callback)
        $(this).bind('change', listener)

        # Start loading more.
        @podcastScope.showMoreEpisodes()

        # Return true to indicate something is happening.
        return true

    # Load all episodes for the current podcast.
    #
    # @param callback  [Function]  The function that will be called once all episodes have been loaded.
    loadAll: (callback) ->
        # Just keep calling loadMore until it fails, at which point the callback should be invoked
        innerCallback = () -> 
            return if @loadMore(innerCallback)
            Utils.doCallback(callback)
        @loadMore(innerCallback)

    # Load the shownotes for all loaded episodes.
    loadAllShowNotes: () ->
        for episode in @podcastScope.episodes
            EpisodeHelper.loadShowNotes($, episode) if episode?

    # Get the order of the episodes list.
    #
    # @return [Orders]  The current order of the episode list.
    getOrder: () ->
        # Unfortunately, the only method to determine the current order is by the displayed text
        text = $('.episodes_sort_value').text()
        return EpisodeOrder.DateNewOld if text.indexOf('▼') >= 0
        return EpisodeOrder.DateOldNew

    # Set the order of the episodes list.
    #
    # @param order  [Orders]  The new order of the episode list.
    setOrder: (order) ->
        if order != @getOrder()
            @podcastScope.changeSortOrder()
