include_once('style')
include_once('search')
include_once('layouts')
include_once('menu')
include_once('interactions')
include_once('playlist')
include_once('watcher')
include_once('settings')

###
************************************
*
* Where everything comes together.
*
************************************
###

###
Load the styles.
###

# Add bootstrap.
$('head').append($('<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">'))

# Load the styles.
styleCore = Style.createAndInject(load('build/css/core.css'))
styleNewSubtle = Style.createAndInject(load('build/css/subtle-new.css'))
styleHeader = Style.createAndInject(load('build/css/hide-header.css'))
styleCompactMenu = Style.createAndInject(load('build/css/compact-menu.css'))
styleLayoutMenu = Style.createAndInject(load('build/css/layouts.css'))

###
Add the extra search functionality.
###

search = new Search()
search.inject()

###
Create the layout menu.
###

# The available layouts.
layouts = [
    'grid', 'grid small', 'grid tiny'
    'list', 'list small', 'list tiny'
]

layout = new LayoutController(layouts)
layout.inject()

###
Page controller that other things can hook into.
###

pageController = new PageController()
pageController.inject()

###
Playlist controller.
###

playlistController = new PlaylistController(pageController)
playlistController.inject()

###
Create the menu.
###

menu = new Menu()
menu.inject()

# Create the menu elements.
buttonSaneMode = menu.createButton('user', 'Sane mode', 'Load everything, hide watched, order old -> new.', () ->
    Interactions.setOrder(EpisodeOrder.DateOldNew)
    Interactions.loadAll(() ->
        Interactions.hideEpisodes(EpisodeSelector.Watched)
    )
)
buttonPlaylistMode = menu.createButton('play', 'Playlist mode', 'Auto-play the next episode.', () ->
    playlistController.enabled = !playlistController.enabled
)
buttonLoadMore = menu.createButton('tag', 'Load more', 'Load more episodes.', Interactions.loadMore)
buttonLoadAll = menu.createButton('tags', 'Load all', 'Load all episodes.', Interactions.loadAll)
dropShow = menu.createDropdown('eye-open', 'Show/hide', 'Show/hide episodes', [
    ['eye-open', 'Show seen episodes', 'Show all seen episodes.', _.partial(Interactions.showEpisodes, EpisodeSelector.Watched)]
    ['eye-close', 'Hide seen episodes', 'Hide all seen episodes.', _.partial(Interactions.hideEpisodes, EpisodeSelector.Watched)]
])
dropStats = menu.createDropdown('info-sign', 'Information', 'Stats about the current podcast.', [
    [null, menu.createEpisodeStats('Total episodes','total'), null, null]
    [null, menu.createEpisodeStats('Watched', 'watched'), null, null]
    [null, menu.createEpisodeStats('Unwatched', 'unwatched'), null, null]
])

###
Watch the page for changes.
###

$(pageController).on('change', () ->
    # Set the button states.
    menu.setState(@page == Page.PODCAST, buttonSaneMode, dropShow, dropStats)
    menu.setState(@page == Page.PODCAST && !@podcastFullyLoaded, buttonLoadMore, buttonLoadAll)

    # Update the playlist button.
    menu.setState((@page == Page.PODCAST && @playerScope.isPlaying()) || playlistController.enabled, buttonPlaylistMode)
    menu.setButton(buttonPlaylistMode, if playlistController.enabled then 'pause' else 'play')

    # Set the stats.
    menu.setEpisodeStats('total', $(EpisodeSelector.All))
    menu.setEpisodeStats('watched', $(EpisodeSelector.Watched))
    menu.setEpisodeStats('unwatched', $(EpisodeSelector.Unwatched))
)

###
Settings.
###

settings = new SettingsController()
settings.inject()
settings.getAndUpdateVersion()

# Settings for the settings screen.
group = settings.addGroup(
    key: 'self'
    title: 'Pocketcast Utils Settings'
    description: 'Settings that affect the behavior of Pocketcast Utils only.'
)
group.addSetting(
    key: 'showOnUpdate'
    title: 'Show on update'
    description: 'Show this screen when there are new, exciting features.'
    callback: (state) -> settings.isShowOnUpdateEnabled = state
    version: [1, 6, 6]
)
group.addSetting(
    key: 'newSubtle'
    title: 'More subtle new markings'
    description: 'Make the markings showing which settings are new more subtle.'
    callback: (state) -> styleNewSubtle.setState(state)
    version: [1, 6, 6]
    default: false
)

# Tweaks on default functionalities/page elements.
group = settings.addGroup(
    key: 'tweaks'
    title: 'Tweaks'
    description: 'Tweaks on default functionalities/page elements.'
)
group.addSetting(
    key: 'header'
    title: 'Hide the header'
    description: 'Hide the default header, creating more screen space.'
    callback: (state) -> styleHeader.setState(state)
    version: [1, 5, 0]
    default: false
)
group.addSetting(
    key: 'search'
    title: 'Episode search'
    description: "Let the search box also filter the currently loaded episodes' titles and descriptions."
    callback: (state) -> search.enabled = state
    version: [1, 3, 1]
)
group.addSetting(
    key: 'layouts'
    title: 'Extra layouts'
    description: 'Extra layouts for the podcast list in the sidebar.'
    callback: (state) -> styleLayoutMenu.setState(state)
    version: [1, 7, 0]
)

# Tweaks on the default menu.
group = settings.addGroup(
    key: 'menu_default'
    title: 'Default menu'
    description: 'Tweaks on the default menu.'
)
group.addSetting(
    key: 'compact_menu'
    title: 'Compact'
    description: 'Make the default menu buttons more compact.'
    callback: (state) -> styleCompactMenu.setState(state)
    version: [1, 6, 0]
)
menuItems = [
    ['Discover', [1, 6, 4]]
    ['New Releases', [1, 6, 4]]
    ['In Progress', [1, 6, 4]]
    ['Starred', [2, 0, 0]]
]
for [name, version] in menuItems
    key = name.toLowerCase().replace(' ', '_')
    $menuElem = $(".section_#{key}")
    group.addSetting(
        key: key
        title: name
        description: 'Show this menu button'
        callback: _.bind(jQuery.fn.toggle, $menuElem)
        version: version
    )

# Tweaks on default functionalities/page elements.
group = settings.addGroup(
    key: 'menu_extra'
    title: 'Extra menu'
    description: 'Tweaks on default functionalities/page elements.'
)
menuItems = [
    [buttonSaneMode, [1, 0, 0], true]
    [buttonPlaylistMode, [1, 4, 0], true]
    [buttonLoadMore, [0, 2, 0], false]
    [buttonLoadAll, [0, 2, 0], false]
    [dropShow, [1, 1, 0], false]
    [dropStats, [1, 2, 0], true]
]   
for [$element, version, def] in menuItems
    group.addSetting(
        key: $element.data('cls')
        title: $element.data('title')
        description: "Show this menu button (function: #{$element.data('description')})"
        callback: _.bind(jQuery.fn.toggle, $element)
        version: version
        default: def
    )

# If there are any new settings, and the option for this to happen is on, show the settings page.
settings.showIfNew()
