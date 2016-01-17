include_once('core')
include_once('time')

###
Creating and modifying the menu.
###

# The menu for in the sidebar.
#
# This class contains all methods related to handling the menu's rendering,
# adding elements, updating elements, etc.
class Menu
    # The menu items.
    @items: []

    # The menu element.
    @element: undefined

    # Inject the menu element into the page.
    inject: () ->
        $('div.header').after(@element)

    constructor: () ->
        @element = $('<div id="menu-utils" class="btn-group-vertical"></div>')

    # Create a button with a dropdown menu.
    #
    # @see Menu#createDropdownItem
    # @param cls          [String]   The glyphicon-class of the icon.
    # @param title        [String]   The text of the button.
    # @param description  [String]   The tooltip text of the button.
    # @param items        [Array]    The items in the menu. This is an array of items, where each item is an array of
    #   arguments as you would pass to createDropdownItem
    # @return             [Element]  The newly created dropdown menu.
    createDropdown: (cls, title, description, items) ->
        # Create the dropdown, find the main elements within.
        group = $('<div class="btn-group btn-utils" role="group"><button type="button" class="btn btn-default
            dropdown-togggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon"></span><span
            class="title"></span><span class="caret"></span></button><ul class="dropdown-menu" role="menu"></ul></div>')
        btn = $(group).find('button')
        icon = $(btn).find('.glyphicon')
        titleElem = $(btn).find('.title')
        menu = $(group).find('ul')

        # Store the parameters on the btn-group.
        $(group).data('cls', cls)
        $(group).data('title', title)
        $(group).data('description', description)

        # Setup the button.
        $(btn).attr('aria-label', title)
        $(btn).attr('title', description)
        $(btn).dropdown()

        # Setup the button icon.
        $(icon).addClass("glyphicon-#{cls}")
        $(icon).after(" #{title} ")

        # Create and add all child items.
        $(menu).append(@createDropdownItem(item...) for item in items)

        # Save and return the newly created dropdown menu.
        Menu.items.push(group)
        @element.append(group)
        return group

    # Create a dropdown menu item.
    #
    # @param cls          [String]    The glyphicon-class of the icon of the menu item.
    # @param title        [String]    The text of the menu item.
    # @param description  [String]    The tooltip text of the menu item.
    # @param callback     [Function]  The function that will be called when the menu item is clicked.
    # @return             [Element]   The newly created menu item.
    createDropdownItem: (cls, title, description, callback) ->
        # Create the list item.
        li = $('<li><a href="#"><span class="glyphicon"></span><span class="title"></spam></a></li>')

        # Setup the list item.
        @setButton(li, cls, title, description, callback)

        # Return the item
        return li

    # Create a button.
    #
    # @param cls          [String]    The glyphicon-class of the icon of the button.
    # @param title        [String]    The text of the button.
    # @param description  [String]    The tooltip text of the button.
    # @param callback     [Function]  The function that will be called when the button is clicked.
    # @return             [Element]   The newly created button.
    createButton: (cls, title, description, callback) ->
        # Create the button.
        btn = $('<button type="button" class="btn btn-default"><span class="glyphicon" aria-hidden="true"></span><span
            class="title"></span></button>')

        # Setup the button.
        @setButton(btn, cls, title, description, callback)

        # Save and return the newly created button.
        Menu.items.push(btn)
        @element.append(btn)
        return btn

    # Create a span with a fixed width, used to show statistics in.
    #
    # @param name [String] Used to create the ID of the block, in the form of stat-{name}.
    # @param width [String] The width of the stat block. Default = auto.
    # @return [Element] The new stat block.
    createStat: (name, width) ->
        width = 'auto' unless width?
        return $("<span id='stat-#{name}' class='stat' style='width: #{width};'></span>")

    # Create a stat block for episode statistics.
    #
    # This is just a convenience function that creates two regular stat blocks
    # with specific names and widths, and combines them.
    #
    # @param title  [String]   The human-readable title/text to display before the stat blocks
    # @param name   [String]   Used to create the ID of the blocks, in the form of stat-{name}-count and
    #   stat-name-time.
    # @return       [Element]  The new stat block.
    createEpisodeStats: (title, name) ->
        return [title, @createStat("#{name}-time"), @createStat("#{name}-count", '40px')]

    # Set the state of a button.
    #
    # @param btn          [Element]   The button to set the state of.
    # @param cls          [String]    The new glyphicon-class of the icon.
    # @param title        [String]    The new text of the button.
    # @param description  [String]    The new tooltip text of the button.
    # @param callback     [Function]  The new function that will be called when the button is clicked.
    # @return             [Element]   The modified button.
    setButton: (btn, cls, title, description, callback) ->
        # Set the icon.
        if cls?
            icon = $(btn).find('.glyphicon')
            $(icon).attr('class', 'glyphicon')
            $(icon).addClass("glyphicon-#{cls}")
            $(btn).data('cls', cls)

        # Set the title.
        if title?
            titleElem = $(btn).find('.title')
            $(btn).attr('aria-label', title)
            $(titleElem).html(title)
            $(btn).data('title', title)

        # Set the description.
        if description?
            $(btn).attr('title', description)
            $(btn).data('description', description)

        # Set the callback.
        if callback?
            $(btn).on('click', (e) ->
                e.preventDefault()
                Utils.doCallback(callback)
            )
            $(btn).data('callback', callback)

        # Return the modified button.
        return btn

    # Update the state of one or more menu items.
    #
    # @param state     [Boolean]  The new state of the buttons, true for enabled, false for disabled.
    # @parsm elems...  [Element]  The element(s) to be updated.
    setState: (state, elems...) ->
        btns = $(elems).find('button').addBack().filter('button')
        if state
            $(btns).removeClass('disabled')
        else
            $(btns).addClass('disabled')

    # Update an episode stats element.
    #
    # @see Menu#createEpisodeStats.
    # @param name [String] The name used when creating the episode stats.
    # @param episodes
    setEpisodeStats: (name, episodes) ->
        time = new Time($(episodes))
        $("#stat-#{name}-count").text($(episodes).length)
        $("#stat-#{name}-time").text(time.formatShort())
        $("#stat-#{name}-time").attr('title', time.formatLong())
