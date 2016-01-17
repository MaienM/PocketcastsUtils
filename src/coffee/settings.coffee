include_once('version')

###
Settings related functionality.
###

class SettingsController
    # The groups in this screen.
    groups: {}

    # Whether to show the settings page when there is new stuff.
    isShowOnUpdateEnabled: true

    # The settings page.
    element: undefined

    # The settings page content.
    elementContent: undefined

    # The settings menu item.
    elementMenu: undefined

    constructor: () ->
        @element = element = $("
            <div id='utils-settings-container' class='dialog_page'>
                <div id='utils-settings' class='dialog_panel'>
                    <h2>
                        Pocketcast Utils
                        <span class='version'>#{GM_info.script.version}</span>
                    </h2>
                    <p>
                        Pocketcast Utils is a Tampermonkey Script that aims to enhance the default Pocketcast interface and experience. 
                        It does this by both adding new, and streamlining existing functionality and interfaces.
                    </p><p>
                        Of course, this should never result in degrading the overal experience. 
                        Therefore, you can choose to enable or disable any of it's features as you please.
                        These changes take effect immediately; you can see their result in the background.
                        By default, certain options will be enabled/disabled, to showcase the main features without getting in the way and overwhelming you.
                    </p><p>
                        This screen will automatically open when new options are added (unless you don't want it to), and those options will then be highlighted.
                        Additionally, this screen can be found under the cog in the top right corner (which, incidentally, is the only thing you cannot turn off).
                        It's the 'Utils Settings' item from the dropdown menu.
                    </p>
                    <a id='resetSettings'>Reset all settings to default</a>
                </div>
            </div>
        ")
        @element.hide()
        @element.on('click', () -> element.hide())
        @elementContent = @element.find('#utils-settings')
        @elementContent.on('click', (e) -> e.stopPropagation())
        @elementContent.find('#resetSettings').on('click', @reset)
        @elementMenu = $('<li><a>Utils Settings</a></li>')
        @elementMenu.on('click', () -> element.show())

    # Inject the menu elements into the page.
    inject: () ->
        $('body').append(@element)
        $('#header .dropdown-menu .divider').last().after('<li class="divider"></li>').after(@elementMenu)

    # If there is anything new, show the settings.
    showIfNew: () ->
        @element.show() if $(@element).find('.new').length > 0 && @isShowOnUpdateEnabled

    # Read the current version, and update it.
    getAndUpdateVersion: () ->
        # The current version.
        @version = new Version(GM_info.script.version)

        # The previous version.
        @prevVersion = new Version(GM_getValue('version'))
        GM_setValue('version', GM_info.script.version)

    # Reset the settings back to defaults
    reset: () ->
        if confirm('Are you sure you want to reset all settings to default? There is no way to undo this!')
            _.each(GM_listValues(), GM_deleteValue)
            GM_setValue('version', GM_info.script.version)

    # Add a new group to the settings screen.
    addGroup: (options) -> 
        group = new SettingsGroup(this, options)
        @groups[options.key] = group
        @elementContent.append(group.element)
        return group


class SettingsGroup
    # The element of the group.
    element: undefined

    # The settings in this group.
    settings: {}

    # The constructor.
    constructor: (@manager, options) ->
        {@key, @title, @description} = options
        @element = $('<div><h3></h3></div>')
        @element.find('h3').html(options.title)

    # Add a new setting to this group.
    addSetting: (options) ->
        setting = new Setting(this, options)
        @settings[options.key] = setting
        @element.append(setting.element)
        return setting


class Setting
    # The elements.
    element: undefined
    elementCheckbox: undefined

    # The constructor.
    constructor: (@group, options) ->
        {@key, @title, @description, @version, @callback, @default} = options
        @default = true unless @default?
        @key = key = "setting-#{@key}"
        @version = new Version(@version)

        # Create the div.
        @element = $('<div class="form-group"></div>')

        # Create the checkbox.
        @elementCheckbox = $("<input id='#{@key}' type='checkbox' />")
        @elementCheckbox.on('change', () -> GM_setValue(key, $(this).is(':checked')))

        # Create the form group.
        @element.append(@elementCheckbox)
        @element.append("<label for='#{@key}'>#{@title}</label>")
        @element.append("<p class='help-block version'>Since v#{@version.toUsefulString()}</label>")
        @element.append("<p class='help-block'>#{@description}</p>")

        # Mark the block as new, if the setting has been added since your previous version.
        @element.addClass('new') if @version > @group.manager.prevVersion

        # List to changes of the setting.
        GM_addValueChangeListener(@key, _.bind(@reload, this))

        # Load the setting.
        @reload()

    # Get the setting's value.
    get: () ->
        return GM_getValue(@key, @default)

    # Set the setting's value.
    set: (value) ->
        GM_setValue(@key, !!value)

    # Load the setting from the storage.
    reload: () ->
        @apply(@get())

    # Apply the setting.
    apply: (value) ->
        # Update the ui if needed
        @elementCheckbox.click() if @elementCheckbox.is(':checked') != value

        # Perform the callback
        @callback(value) if @callback?
