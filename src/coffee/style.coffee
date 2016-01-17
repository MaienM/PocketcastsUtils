###
Everything related to custom CSS inserted to the page.
###

class Style
    # The style element.
    element: null

    # Create a style block.
    #
    # @param contents  [String]   The desired contents of the style block.
    constructor: (contents) ->
        @element = $('<style></style>')
        @element.html(contents)

    # Inject the style into the page.
    inject: () ->
        $('head').append(@element)

    # Enable/disable this style.
    #
    # @param state  [Boolean]  True if the style should be enabled, false if it should be disabled.
    setState: (state) ->
        @element[0].disabled = !state

    # Create a new style element, and inject it into the page.
    #
    # @param contents  [String]   The desired contents of the style block.
    @createAndInject: (contents) ->
        style = new Style(contents)
        style.inject()
        return style
