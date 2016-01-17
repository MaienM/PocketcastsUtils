###
Extra layouts for the podcast list.
###

class LayoutController
    # The layouts available to this manager.
    layouts: {}

    # The elements.
    elementButton: undefined
    elementMenu: undefined
    @elementList: undefined

    # Create a layout manager with the given layouts.
    constructor: (layouts) -> 
        @elementButton = elementButton = $('
            <div class="dropdown-toggle layouts btn-layout" data-toggle="dropdown"
                 aria-expanded="false" aria-label="Layouts" title="Layouts"></div>
        ')
        @elementMenu = elementMenu = $('<ul class="dropdown-menu layouts-menu" role="menu"></ul>')
        @elementList = elementList = $('#content_left > .scrollable')

        # Convert the layout names into classes.
        for layout in layouts
            @layouts[layout] = layout.replace(' ', '-')
        layouts = @layouts

        # Create a button for each layout.
        for [layout, cls] in _.pairs(@layouts)
            do (layout, cls, elementButton, elementMenu, elementList, layouts) ->
                # Create a button for the layout.
                $button = $('<span class="button btn-layout"></span>');
                $button.addClass(cls)
                $button.attr('title', layout)

                # Bind a click handler to it.
                $button.on('click', (e) ->
                    # Set the correct button class.
                    elementButton.removeClass(_.values(layouts).join(' '))
                    elementButton.addClass(cls)

                    # Set the correct list class.
                    elementList.removeClass(_.keys(layouts).join(' '))
                    elementList.addClass(layout)

                    # Store the layout.
                    GM_setValue('layout', layout)

                    # Prevent the click from doing anything else.
                    e.preventDefault()
                )

                # Add the button to the menu.
                elementMenu.append($button)

        # Load the settings.
        @reload()

    # Inject the menu element into the page.
    inject: () ->
        $('.podcast_search').after(@elementButton)
        $(@elementButton).after(@elementMenu)

    # (Re)load the settings.
    reload: () ->
        layout = @layouts[GM_getValue('layout', _.keys(@layouts)[0])]
        @elementMenu.find("span.btn-layout.#{layout}").click()
