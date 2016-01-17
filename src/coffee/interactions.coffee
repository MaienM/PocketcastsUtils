include_once('core')

###
Methods that wrap existing Pocketcasts functionality.

This way, there is one central spot that contains all logic depending on the internals of Pocketcasts.
###

EpisodeSelector =
    # jQuery selector matching all episodes.
    All: '.episode_row'

    # jQuery selector matching all unwatched episodes. 0 is unwatched, 1 is marked as unwatched.
    Unwatched: '.played_status_0, .played_status_1'

    # jQuery selector matching all episodes that are in progress.
    Partial: '.played_status_2'

    # jQuery selector matching all watched episodes. 3 is watched, 4 is marked as watched.
    Watched: '.played_status_3, .played_status_4'

EpisodeOrder =
    # Constant for date new -> old ordering
    DateNewOld: 'DATE_NEW_OLD'

    # Constant for date old -> new ordering
    DateOldNew: 'DATE_OLD_NEW'

Interactions =
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

    # Get the podcast controller.
    getPodcastController: () ->
        return $('.episodes_list').scope()

    # Load more episodes for the current podcast.
    #
    # @param callback  [Function]  The function that will be called once more episodes have been loaded.
    # @return          [Element]   Whether more episodes are being loaded.
    loadMore: (callback) ->
        controller = Interactions.getPodcastController()

        # If there are no more episodes to load, return false and do nothing.
        return false unless controller.episodesTotal > _.size(controller.episodes)

        # Listen to changes to determine when the loading is done.
        listObserver = new MutationObserver((mutations, observer) ->
            listObserver.disconnect()
            Utils.doCallback(callback)
        )
        listObserver.observe($('#podcast_show div.episodes_list')[0], {
            subtree: true
            childList: true
        })

        # Start loading more.
        controller.showMoreEpisodes()

        # Return true to indicate something is happening.
        return true

    # Load all episodes for the current podcast.
    #
    # @param callback  [Function]  The function that will be called once all episodes have been loaded.
    loadAll: (callback) ->
        # Just keep calling loadMore until it fails, at which point the callback should be invoked
        innerCallback = () -> Utils.doCallback(callback) unless Interactions.loadMore(innerCallback)
        Interactions.loadMore(innerCallback)

    # Load the shownotes for all loaded episodes.
    loadAllShowNotes: () ->
        controller = Interactions.getPodcastController()
        
        for episode in controller.episodes
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
        if order != Interactions.getOrder()
            Interactions.getPodcastController().changeSortOrder()
