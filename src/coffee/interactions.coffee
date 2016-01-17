include_once('core')

###
Methods that wrap existing PocketCasts functionality.

There methods are only made for things that are:
- Difficult/cumbersome.
- Not readily available for me to call (or I've not yet discovered how).
###

EpisodeSelector =
    # jQuery selector matching all unwatched episodes. 0 is unwatched, 1 is marked as unwatched.
    All: '.episode_row'

    # jQuery selector matching all unwatched episodes. 0 is unwatched, 1 is marked as unwatched.
    Unwatched: '.played_status_0, .played_status_1'

    # jQuery selector matching all episodes that are in progress.
    Partial: '.played_status_2'

    # jQuery selector matching all unwatched episodes. 3 is watched, 4 is marked as watched.
    Watched: '.played_status_3, .played_status_4'

Interactions =
    # Hide all elements from the given list/matching the given selector, except for
    # the last one.
    #
    # @param elems The elements/selector to hide.
    doHide: (elems) ->
        $(elems).hide()
        $(elems).last().show()

    # Show all elements from the given list/matching the given selector.
    #
    # @param elems The elements/selector to show.
    doShow: (elems) ->
        $(elems).show()

    # Load the shownotes for all loaded episodes.
    loadAllShowNotes: () ->
        $('.episode_row').each(() ->
            episode = $(this).scope().episode
            EpisodeHelper.loadShowNotes($, episode) if episode?
        )
