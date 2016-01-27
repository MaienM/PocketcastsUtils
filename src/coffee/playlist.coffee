include_once('core')

###
Stuff related to the playlist mode, where the next episode is automatically
started when the current episode ends.
###

# The class responsible for playlist mode, where the next episode is automatically started after the previous one ends.
class PlaylistController
    # The page controller.
    pageController: null

    # Whether the playlist mode is currently on.
    enabled: false

    # Whether there should be announcements inbetween episodes.
    announcements: true

    # Create a new playlist controller.
    #
    # @param pageController  [PageController]  The page controller.
    constructor: (@pageController) ->

    # Attach to the page.
    inject: () ->
        # Bind to events.
        $('audio, video').on('ended', _.bind(@startNextEpisode, this))

    # Start the next episode.
    #
    # @param callback  [Function?]  A function to be called once the next episode has been started.
    startNextEpisode: (callback) ->
        # Check if playlist mode is even on.
        return unless @enabled

        # Determine what should happen/the announcement.
        nextEpisode = @getNextEpisode()
        podcast = @pageController.playerEpisodePodcastData
        pageController = @pageController
        announcement = new SpeechSynthesisUtterance("Next up: #{nextEpisode.title}")
        announcement.lang = 'en-US';
        if nextEpisode?
            # Prepare an announcement for the episode.
            announcement.text = "Next up: #{nextEpisode.title}"

            # Once the announcement is done, go to the next episode.
            announcement.onend = () ->
                pageController.podcastScope.playPause(nextEpisode, podcast)
                Utils.doCallback(callback)
        else
            # Prepare an announcement for end-of-playlist.
            announcement.text = 'End of queue'

            # Stop the playlist mode.
            isPlaylistMode = false
            pageController.rescan()

        # Start the announcement.
        if @announcements
            speechSynthesis.speak(announcement)
        else if announcement.onend?
            announcement.onend()

    # Get the next episode.
    #
    # @private
    # @return [EpisodeScope] The next episode.
    getNextEpisode: () ->
        episodes = @pageController.playerEpisodePodcastScope.episodes
        episodes = _.sortBy(episodes, 'published_at')
        lastEpisode = @pageController.playerEpisodeData
        lastEpisodeIndex = _.indexOf(episodes, lastEpisode)
        return episodes[lastEpisodeIndex + 1]
