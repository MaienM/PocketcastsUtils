###
Extra search functionality
###

# The class responsible for search enhancements.
class Search
    # The search box.
    @element: null

    # Whether searching is enabled.
    @enabled: true

    # Inject the search stuff into the page.
    inject: () ->
        @element = $('.podcast_search input')
        $(@element).on('change keyup paste', _.debounce(_.bind(@performSearch, this), 100))
        $('.clear_search').on('click', () ->
            $(@element).trigger('change')
        )

    # Perform the search.
    performSearch: () ->
        return unless @enabled

        # Get the search parameter.
        searchValue = $(@element).val()

        if searchValue == ''
            $(EpisodeSelector.All).show()
        else
            # Create a regex from the search parameter.
            searchRegex = new RegExp(searchValue, 'i')
            
            # Show/hide elements.
            $(EpisodeSelector.All).each(() ->
                # Show/hide element.
                episode = $(this).scope().episode
                if searchRegex.test(episode.title) || searchRegex.test(episode.show_notes)
                    $(this).show()
                else
                    $(this).hide()
            )

