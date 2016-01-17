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

    # The current episode, if any.
    episodeScope: null

    # The current episode's podcast scope, if any.
    episodePodcastScope: null

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
            })
        else
            $('#main').$watch(rescan)

    # Update the state by re-observing the page.
    #
    # There should be no need to call this manually, as changes to the page should automatically trigger @
    #
    # Once the status has been updated, a 'change' event will be raised.
    rescan: () ->
        # Determine the current podcast.
        prevPodcastScope = @podcastScope
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
        @episodeScope = @playerScope.mediaPlayer.episode
        @episodePodcastScope = @playerScope.mediaPlayer.podcast

        # Determine the current podcast page state.
        @podcastFullyLoaded = undefined
        @podcastFullyLoaded = @podcastScope.episodes.length == @podcastScope.episodesTotal if @podcastScope?

        # Fire off the event.
        $(this).trigger('change', this)
