// ==UserScript==
// @name         Pocketcasts Utils
// @namespace    https://github.com/MaienM/PocketcastUtils
// @updateURL    http://waxd.nl/PocketcastsUtils.user.js
// @version      2.0.0-beta20162701152651950
// @description  Enhance your Pocketcast experience with extra interface options, filters and other functionality
// @author       MaienM
// @match        https://play.pocketcasts.com/*
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @require      https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js
// ==/UserScript==

(function() {
  var $element, $menuElem, EpisodeOrder, EpisodeSelector, LayoutController, Menu, MutationObserver, Page, PageController, PlaylistController, Search, Setting, SettingsController, SettingsGroup, Style, Time, Utils, Version, buttonLoadAll, buttonLoadMore, buttonPlaylistMode, buttonSaneMode, def, dropShow, dropStats, group, key, layout, layouts, menu, menuItems, name, pageController, playlistController, search, settings, styleCompactMenu, styleCore, styleHeader, styleLayoutMenu, styleNewSubtle, version, _i, _j, _len, _len1, _ref, _ref1,
    __slice = [].slice;


  /*
  Everything related to custom CSS inserted to the page.
   */
  Style = (function() {
    Style.prototype.element = null;

    function Style(contents) {
      this.element = $('<style></style>');
      this.element.html(contents);
    }

    Style.prototype.inject = function() {
      return $('head').append(this.element);
    };

    Style.prototype.setState = function(state) {
      return this.element[0].disabled = !state;
    };

    Style.createAndInject = function(contents) {
      var style;
      style = new Style(contents);
      style.inject();
      return style;
    };

    return Style;

  })();


  /*
  Extra search functionality
   */
  Search = (function() {
    function Search() {}

    Search.element = null;

    Search.enabled = true;

    Search.prototype.inject = function() {
      this.element = $('.podcast_search input');
      $(this.element).on('change keyup paste', _.debounce(_.bind(this.performSearch, this), 100));
      return $('.clear_search').on('click', function() {
        return $(this.element).trigger('change');
      });
    };

    Search.prototype.performSearch = function() {
      var searchRegex, searchValue;
      if (!this.enabled) {
        return;
      }
      searchValue = $(this.element).val();
      if (searchValue === '') {
        return $(EpisodeSelector.All).show();
      } else {
        searchRegex = new RegExp(searchValue, 'i');
        return $(EpisodeSelector.All).each(function() {
          var episode;
          episode = $(this).scope().episode;
          if (searchRegex.test(episode.title) || searchRegex.test(episode.show_notes)) {
            return $(this).show();
          } else {
            return $(this).hide();
          }
        });
      }
    };

    return Search;

  })();


  /*
  Extra layouts for the podcast list.
   */
  LayoutController = (function() {
    LayoutController.prototype.layouts = {};

    LayoutController.prototype.elementButton = void 0;

    LayoutController.prototype.elementMenu = void 0;

    LayoutController.elementList = void 0;

    function LayoutController(layouts) {
      var cls, elementButton, elementList, elementMenu, layout, _fn, _i, _j, _len, _len1, _ref, _ref1;
      this.elementButton = elementButton = $('<div class="dropdown-toggle layouts btn-layout" data-toggle="dropdown" aria-expanded="false" aria-label="Layouts" title="Layouts"></div>');
      this.elementMenu = elementMenu = $('<ul class="dropdown-menu layouts-menu" role="menu"></ul>');
      this.elementList = elementList = $('#content_left > .scrollable');
      for (_i = 0, _len = layouts.length; _i < _len; _i++) {
        layout = layouts[_i];
        this.layouts[layout] = layout.replace(' ', '-');
      }
      layouts = this.layouts;
      _ref = _.pairs(this.layouts);
      _fn = function(layout, cls, elementButton, elementMenu, elementList, layouts) {
        var $button;
        $button = $('<span class="button btn-layout"></span>');
        $button.addClass(cls);
        $button.attr('title', layout);
        $button.on('click', function(e) {
          elementButton.removeClass(_.values(layouts).join(' '));
          elementButton.addClass(cls);
          elementList.removeClass(_.keys(layouts).join(' '));
          elementList.addClass(layout);
          GM_setValue('layout', layout);
          return e.preventDefault();
        });
        return elementMenu.append($button);
      };
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        _ref1 = _ref[_j], layout = _ref1[0], cls = _ref1[1];
        _fn(layout, cls, elementButton, elementMenu, elementList, layouts);
      }
      this.reload();
    }

    LayoutController.prototype.inject = function() {
      $('.podcast_search').after(this.elementButton);
      return $(this.elementButton).after(this.elementMenu);
    };

    LayoutController.prototype.reload = function() {
      var layout;
      layout = this.layouts[GM_getValue('layout', _.keys(this.layouts)[0])];
      return this.elementMenu.find("span.btn-layout." + layout).click();
    };

    return LayoutController;

  })();


  /*
  Some core functions that are used throughout the program.
   */
  Utils = (function() {
    function Utils() {}

    Utils.doCallback = function(callback) {
      if (typeof callback === 'function') {
        return callback();
      }
    };

    Utils.noop = function() {
      return void 0;
    };

    Utils.padLeft = function(input, width, padding) {
      if (padding == null) {
        padding = ' ';
      }
      input = input.toString();
      padding = padding.toString();
      if (!(width > 0)) {
        throw "width must be > 0";
      }
      if (padding.length !== 1) {
        throw "padding must be exactly 1 character";
      }
      while (input.length < width) {
        input = padding + input;
      }
      return input;
    };

    return Utils;

  })();

  /*
  Time related functions.
   */
  Time = (function() {
    Time.TIME_MINUTE = 60;

    Time.TIME_HOUR = 60 * Time.TIME_MINUTE;

    Time.TIME_DAY = 24 * Time.TIME_HOUR;

    Time.TIME_WEEK = 7 * Time.TIME_DAY;

    Time.prototype.seconds = 0;

    function Time(elems) {
      var elem, _i, _len;
      this.seconds = 0;
      for (_i = 0, _len = elems.length; _i < _len; _i++) {
        elem = elems[_i];
        this.seconds += parseInt($(elem).scope().episode.duration);
      }
    }

    Time.prototype.formatShort = function() {
      var hours, minutes;
      hours = Math.floor(this.seconds / Time.TIME_HOUR);
      minutes = Math.floor((this.seconds % Time.TIME_HOUR) / Time.TIME_MINUTE);
      return "" + hours + ":" + (Utils.padLeft(minutes, 2, '0'));
    };

    Time.prototype.formatLong = function() {
      var days, hours, minutes, part, parts, seconds, weeks;
      weeks = Math.floor(this.seconds / Time.TIME_WEEK);
      days = Math.floor((this.seconds % Time.TIME_WEEK) / Time.TIME_DAY);
      hours = Math.floor((this.seconds % Time.TIME_DAY) / Time.TIME_HOUR);
      minutes = Math.floor((this.seconds % Time.TIME_HOUR) / Time.TIME_MINUTE);
      seconds = this.seconds % Time.TIME_MINUTE;
      part = function(num, text) {
        if (num === 1) {
          return "" + num + " " + text;
        }
        if (num > 2) {
          return "" + num + " " + text + "s";
        }
      };
      parts = [part(weeks, 'week'), part(days, 'day'), part(hours, 'hour'), part(minutes, 'minute'), part(seconds, 'second')];
      return _.filter(parts).join(', ');
    };

    return Time;

  })();

  /*
  Creating and modifying the menu.
   */
  Menu = (function() {
    Menu.items = [];

    Menu.element = void 0;

    Menu.prototype.inject = function() {
      return $('div.header').after(this.element);
    };

    function Menu(pageController) {
      this.pageController = pageController;
      this.element = $('<div id="menu-utils" class="btn-group-vertical"></div>');
    }

    Menu.prototype.createDropdown = function(cls, title, description, items) {
      var btn, group, icon, item, menu, titleElem;
      group = $('<div class="btn-group btn-utils" role="group"><button type="button" class="btn btn-default dropdown-togggle" data-toggle="dropdown" aria-expanded="false"><span class="glyphicon"></span><span class="title"></span><span class="caret"></span></button><ul class="dropdown-menu" role="menu"></ul></div>');
      btn = $(group).find('button');
      icon = $(btn).find('.glyphicon');
      titleElem = $(btn).find('.title');
      menu = $(group).find('ul');
      $(group).data('cls', cls);
      $(group).data('title', title);
      $(group).data('description', description);
      $(btn).attr('aria-label', title);
      $(btn).attr('title', description);
      $(btn).dropdown();
      $(icon).addClass("glyphicon-" + cls);
      $(icon).after(" " + title + " ");
      $(menu).append((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push(this.createDropdownItem.apply(this, item));
        }
        return _results;
      }).call(this));
      Menu.items.push(group);
      this.element.append(group);
      return group;
    };

    Menu.prototype.createDropdownItem = function(cls, title, description, callback) {
      var li;
      li = $('<li><a href="#"><span class="glyphicon"></span><span class="title"></spam></a></li>');
      this.setButton(li, cls, title, description, callback);
      return li;
    };

    Menu.prototype.createButton = function(cls, title, description, callback) {
      var btn;
      btn = $('<button type="button" class="btn btn-default"><span class="glyphicon" aria-hidden="true"></span><span class="title"></span></button>');
      this.setButton(btn, cls, title, description, callback);
      Menu.items.push(btn);
      this.element.append(btn);
      return btn;
    };

    Menu.prototype.createStat = function(name, width) {
      if (width == null) {
        width = 'auto';
      }
      return $("<span id='stat-" + name + "' class='stat' style='width: " + width + ";'></span>");
    };

    Menu.prototype.createEpisodeStats = function(title, name) {
      return [title, this.createStat("" + name + "-time"), this.createStat("" + name + "-count", '40px')];
    };

    Menu.prototype.setButton = function(btn, cls, title, description, callback) {
      var icon, pageController, titleElem;
      if (cls != null) {
        icon = $(btn).find('.glyphicon');
        $(icon).attr('class', 'glyphicon');
        $(icon).addClass("glyphicon-" + cls);
        $(btn).data('cls', cls);
      }
      if (title != null) {
        titleElem = $(btn).find('.title');
        $(btn).attr('aria-label', title);
        $(titleElem).html(title);
        $(btn).data('title', title);
      }
      if (description != null) {
        $(btn).attr('title', description);
        $(btn).data('description', description);
      }
      if (callback != null) {
        pageController = this.pageController;
        $(btn).on('click', function(e) {
          e.preventDefault();
          Utils.doCallback(callback);
          return pageController.rescan();
        });
        $(btn).data('callback', callback);
      }
      return btn;
    };

    Menu.prototype.setState = function() {
      var btns, elems, state;
      state = arguments[0], elems = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      btns = $(elems).find('button').addBack().filter('button');
      if (state) {
        return $(btns).removeClass('disabled');
      } else {
        return $(btns).addClass('disabled');
      }
    };

    Menu.prototype.setEpisodeStats = function(name, episodes) {
      var time;
      time = new Time($(episodes));
      $("#stat-" + name + "-count").text($(episodes).length);
      $("#stat-" + name + "-time").text(time.formatShort());
      return $("#stat-" + name + "-time").attr('title', time.formatLong());
    };

    return Menu;

  })();


  /*
  Stuff related to the playlist mode, where the next episode is automatically
  started when the current episode ends.
   */
  PlaylistController = (function() {
    PlaylistController.prototype.pageController = null;

    PlaylistController.prototype.enabled = false;

    PlaylistController.prototype.announcements = true;

    function PlaylistController(pageController) {
      this.pageController = pageController;
    }

    PlaylistController.prototype.inject = function() {
      return $('audio, video').on('ended', _.bind(this.startNextEpisode, this));
    };

    PlaylistController.prototype.startNextEpisode = function(callback) {
      var announcement, isPlaylistMode, nextEpisode, pageController, podcast;
      if (!this.enabled) {
        return;
      }
      nextEpisode = this.getNextEpisode();
      podcast = this.pageController.playerEpisodePodcastData;
      pageController = this.pageController;
      announcement = new SpeechSynthesisUtterance("Next up: " + nextEpisode.title);
      announcement.lang = 'en-US';
      if (nextEpisode != null) {
        announcement.text = "Next up: " + nextEpisode.title;
        announcement.onend = function() {
          pageController.podcastScope.playPause(nextEpisode, podcast);
          return Utils.doCallback(callback);
        };
      } else {
        announcement.text = 'End of queue';
        isPlaylistMode = false;
        pageController.rescan();
      }
      if (this.announcements) {
        return speechSynthesis.speak(announcement);
      } else if (announcement.onend != null) {
        return announcement.onend();
      }
    };

    PlaylistController.prototype.getNextEpisode = function() {
      var episodes, lastEpisode, lastEpisodeIndex;
      episodes = this.pageController.playerEpisodePodcastScope.episodes;
      episodes = _.sortBy(episodes, 'published_at');
      lastEpisode = this.pageController.playerEpisodeData;
      lastEpisodeIndex = _.indexOf(episodes, lastEpisode);
      return episodes[lastEpisodeIndex + 1];
    };

    return PlaylistController;

  })();


  /*
  Watching the page for changes, tracking it's state.
   */
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  Page = {
    DISCOVER: 1,
    NEW_RELEASES: 2,
    IN_PROGRESS: 3,
    STARRED: 4,
    PODCAST: 5,
    UNKNOWN: 6
  };
  EpisodeSelector = {
    All: '.episode_row',
    Unwatched: '.played_status_0, .played_status_1',
    Partial: '.played_status_2',
    Watched: '.played_status_3, .played_status_4'
  };
  EpisodeOrder = {
    DateNewOld: 'DATE_NEW_OLD',
    DateOldNew: 'DATE_OLD_NEW'
  };
  PageController = (function() {
    PageController.prototype.mainScope = null;

    PageController.prototype.playerScope = null;

    PageController.prototype.podcastScope = null;

    PageController.prototype.playerEpisodeData = null;

    PageController.prototype.playerEpisodePodcastData = null;

    PageController.prototype.page = Page.UNKNOWN;

    PageController.prototype.podcastFullyLoaded = void 0;

    function PageController() {}

    PageController.prototype.inject = function() {
      var pageObserver, rescan;
      this.mainScope = $('#main').scope();
      this.playerScope = $('#players').scope();
      rescan = _.bind(this.rescan, this);
      if (MutationObserver != null) {
        pageObserver = new MutationObserver(rescan);
        return pageObserver.observe($('#content_middle')[0], {
          subtree: true,
          childList: true,
          attributes: true
        });
      } else {
        return $(this.mainScope).$watch(rescan);
      }
    };

    PageController.prototype.rescan = function() {
      var oldState, snapshotState;
      snapshotState = function() {
        return _.pick(this, ['page', 'playerEpisodeData', 'playerEpisodePodcastData', 'playerEpisodePodcastScope', 'playerScope', 'podcastFullyLoaded', 'podcastScope']);
      };
      oldState = snapshotState();
      this.podcastScope = $('#podcast_show').scope();
      this.page = (function() {
        switch (false) {
          case !this.mainScope.isSectionDiscover():
            return Page.DISCOVER;
          case !this.mainScope.isSectionNewReleases():
            return Page.NEW_RELEASES;
          case !this.mainScope.isSectionInProgress():
            return Page.IN_PROGRESS;
          case !this.mainScope.isSectionStarred():
            return Page.STARRED;
          case this.podcastScope == null:
            return Page.PODCAST;
          default:
            return Page.UNKNOWN;
        }
      }).call(this);
      this.playerEpisodeData = this.playerScope.mediaPlayer.episode;
      this.playerEpisodePodcastData = this.playerScope.mediaPlayer.podcast;
      if (this.playerEpisodePodcastData != null) {
        if (this.podcastScope.podcast.uuid === this.playerEpisodePodcastData.uuid) {
          this.playerEpisodePodcastScope = this.podcastScope;
        }
      } else {
        this.playerEpisodePodcastScope = null;
      }
      this.podcastFullyLoaded = void 0;
      if (this.podcastScope != null) {
        this.podcastFullyLoaded = this.podcastScope.episodes.length === this.podcastScope.episodesTotal;
      }
      if (!_.isEqual(oldState, snapshotState())) {
        return $(this).trigger('change', this);
      }
    };

    PageController.prototype.hideEpisodes = function(elems) {
      $(elems).hide();
      return $(elems).last().show();
    };

    PageController.prototype.showEpisodes = function(elems) {
      return $(elems).show();
    };

    PageController.prototype.loadMore = function(callback) {
      var currentlyLoaded, listener;
      if (this.podcastFullyLoaded) {
        return false;
      }
      currentlyLoaded = this.podcastScope.episodes.length;
      listener = function() {
        if (this.podcastScope.episodes.length > currentlyLoaded) {
          $(this).unbind(listener);
        }
        return Utils.doCallback(callback);
      };
      $(this).bind('change', listener);
      this.podcastScope.showMoreEpisodes();
      return true;
    };

    PageController.prototype.loadAll = function(callback) {
      var innerCallback;
      innerCallback = function() {
        if (this.loadMore(innerCallback)) {
          return;
        }
        return Utils.doCallback(callback);
      };
      return this.loadMore(innerCallback);
    };

    PageController.prototype.loadAllShowNotes = function() {
      var episode, _i, _len, _ref, _results;
      _ref = this.podcastScope.episodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        episode = _ref[_i];
        if (episode != null) {
          _results.push(EpisodeHelper.loadShowNotes($, episode));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    PageController.prototype.getOrder = function() {
      var text;
      text = $('.episodes_sort_value').text();
      if (text.indexOf('▼') >= 0) {
        return EpisodeOrder.DateNewOld;
      }
      return EpisodeOrder.DateOldNew;
    };

    PageController.prototype.setOrder = function(order) {
      if (order !== this.getOrder()) {
        return this.podcastScope.changeSortOrder();
      }
    };

    return PageController;

  })();


  /*
  Version comparison.
   */
  Version = (function() {
    Version.parts = [];

    function Version() {
      if (arguments.length > 1) {
        this.parts = arguments;
      } else if (_.isArray(arguments[0])) {
        this.parts = arguments[0];
      } else if (_.isUndefined(arguments[0])) {
        this.parts = [];
      } else {
        this.parts = _.chain((arguments[0] + '').split(',')).map(function(p) {
          return p.split('.');
        }).flatten().map(function(p) {
          return +p;
        }).without(NaN).value();
      }
    }

    Version.prototype.toString = function() {
      return _.map(this.parts, _.partial(Utils.padLeft, _, 3, '0')).toString();
    };

    Version.prototype.toUsefulString = function() {
      return this.parts.toString().replace(/,/g, '.');
    };

    return Version;

  })();

  /*
  Settings related functionality.
   */
  SettingsController = (function() {
    SettingsController.prototype.groups = {};

    SettingsController.prototype.isShowOnUpdateEnabled = true;

    SettingsController.prototype.element = void 0;

    SettingsController.prototype.elementContent = void 0;

    SettingsController.prototype.elementMenu = void 0;

    function SettingsController() {
      var element;
      this.element = element = $("<div id='utils-settings-container' class='dialog_page'> <div id='utils-settings' class='dialog_panel'> <h2> Pocketcast Utils <span class='version'>" + GM_info.script.version + "</span> </h2> <p> Pocketcast Utils is a Tampermonkey Script that aims to enhance the default Pocketcast interface and experience. It does this by both adding new, and streamlining existing functionality and interfaces. </p><p> Of course, this should never result in degrading the overal experience. Therefore, you can choose to enable or disable any of it's features as you please. These changes take effect immediately; you can see their result in the background. By default, certain options will be enabled/disabled, to showcase the main features without getting in the way and overwhelming you. </p><p> This screen will automatically open when new options are added (unless you don't want it to), and those options will then be highlighted. Additionally, this screen can be found under the cog in the top right corner (which, incidentally, is the only thing you cannot turn off). It's the 'Utils Settings' item from the dropdown menu. </p> <a id='resetSettings'>Reset all settings to default</a> </div> </div>");
      this.element.hide();
      this.element.on('click', function() {
        return element.hide();
      });
      this.elementContent = this.element.find('#utils-settings');
      this.elementContent.on('click', function(e) {
        return e.stopPropagation();
      });
      this.elementContent.find('#resetSettings').on('click', this.reset);
      this.elementMenu = $('<li><a>Utils Settings</a></li>');
      this.elementMenu.on('click', function() {
        return element.show();
      });
    }

    SettingsController.prototype.inject = function() {
      $('body').append(this.element);
      return $('#header .dropdown-menu .divider').last().after('<li class="divider"></li>').after(this.elementMenu);
    };

    SettingsController.prototype.showIfNew = function() {
      if ($(this.element).find('.new').length > 0 && this.isShowOnUpdateEnabled) {
        return this.element.show();
      }
    };

    SettingsController.prototype.getAndUpdateVersion = function() {
      this.version = new Version(GM_info.script.version);
      this.prevVersion = new Version(GM_getValue('version'));
      return GM_setValue('version', GM_info.script.version);
    };

    SettingsController.prototype.reset = function() {
      if (confirm('Are you sure you want to reset all settings to default? There is no way to undo this!')) {
        _.each(GM_listValues(), GM_deleteValue);
        return GM_setValue('version', GM_info.script.version);
      }
    };

    SettingsController.prototype.addGroup = function(options) {
      var group;
      group = new SettingsGroup(this, options);
      this.groups[options.key] = group;
      this.elementContent.append(group.element);
      return group;
    };

    return SettingsController;

  })();
  SettingsGroup = (function() {
    SettingsGroup.prototype.element = void 0;

    SettingsGroup.prototype.settings = {};

    function SettingsGroup(manager, options) {
      this.manager = manager;
      this.key = options.key, this.title = options.title, this.description = options.description;
      this.element = $('<div><h3></h3></div>');
      this.element.find('h3').html(options.title);
    }

    SettingsGroup.prototype.addSetting = function(options) {
      var setting;
      setting = new Setting(this, options);
      this.settings[options.key] = setting;
      this.element.append(setting.element);
      return setting;
    };

    return SettingsGroup;

  })();
  Setting = (function() {
    Setting.prototype.element = void 0;

    Setting.prototype.elementCheckbox = void 0;

    function Setting(group, options) {
      var key;
      this.group = group;
      this.key = options.key, this.title = options.title, this.description = options.description, this.version = options.version, this.callback = options.callback, this["default"] = options["default"];
      if (this["default"] == null) {
        this["default"] = true;
      }
      this.key = key = "setting-" + this.key;
      this.version = new Version(this.version);
      this.element = $('<div class="form-group"></div>');
      this.elementCheckbox = $("<input id='" + this.key + "' type='checkbox' />");
      this.elementCheckbox.on('change', function() {
        return GM_setValue(key, $(this).is(':checked'));
      });
      this.element.append(this.elementCheckbox);
      this.element.append("<label for='" + this.key + "'>" + this.title + "</label>");
      this.element.append("<p class='help-block version'>Since v" + (this.version.toUsefulString()) + "</label>");
      this.element.append("<p class='help-block'>" + this.description + "</p>");
      if (this.version > this.group.manager.prevVersion) {
        this.element.addClass('new');
      }
      GM_addValueChangeListener(this.key, _.bind(this.reload, this));
      this.reload();
    }

    Setting.prototype.get = function() {
      return GM_getValue(this.key, this["default"]);
    };

    Setting.prototype.set = function(value) {
      return GM_setValue(this.key, !!value);
    };

    Setting.prototype.reload = function() {
      return this.apply(this.get());
    };

    Setting.prototype.apply = function(value) {
      if (this.elementCheckbox.is(':checked') !== value) {
        this.elementCheckbox.click();
      }
      if (this.callback != null) {
        return this.callback(value);
      }
    };

    return Setting;

  })();


  /*
  ************************************
  *
  * Where everything comes together.
  *
  ************************************
   */


  /*
  Load the styles.
   */

  $('head').append($('<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">'));

  styleCore = Style.createAndInject("body{font-family:\"proxima-nova\",\"Helvetica Neue\",Helvetica,Arial,sans-serif}h1{font-size:24px}h6.podcast_search{margin:0}.episodes_list h6{margin:0}.modal{z-index:2000}.stat{float:right;text-align:right;padding:0 2px}.stat:first-child{padding-right:0}#menu-utils{width:100%}#menu-utils button span.glyphicon{float:left}#menu-utils button span.caret{float:right;margin-top:0.5em}#menu-utils .btn-group ul{width:100%;margin-top:-1px}#menu-utils .stat{float:right;text-align:right;padding:0 2px}#menu-utils .stat:first-child{padding-right:0}#utils-settings{width:60%;height:80%;text-align:left;padding:0 2em;overflow-y:scroll}#utils-settings h2 .version{font-size:75%;margin-left:1em}#utils-settings h2 .version:before{content:'v'}#utils-settings .form-group{padding:0 0.3em;position:relative}#utils-settings .form-group.new{background-color:lightgreen}#utils-settings .form-group.new:after{content:'New!';position:absolute;top:0.1em;right:0em;font-size:2.2em;color:red;background-color:inherit;width:4em;text-align:right;padding-right:0.5em}#utils-settings .form-group input+label{margin-left:0.5em}#utils-settings .form-group .help-block{margin-top:-3px}#utils-settings .form-group .version{position:absolute;top:0.3em;right:0.2em;width:6em;text-align:right;font-size:0.9em}\n");

  styleNewSubtle = Style.createAndInject("#settings .form-group.new{background-color:inherit}#settings .form-group.new:after{font-size:1em;top:auto;bottom:0.1em}\n");

  styleHeader = Style.createAndInject("#header{top:-66px}#header:hover{top:0;-webkit-animation:slidein 1s}@-webkit-keyframes slidein{from{top:-66px}to{top:0}}#main{padding-top:4px}\n");

  styleCompactMenu = Style.createAndInject("#content_left .episode_section{height:41px}#content_left .episode_section a{line-height:41px !important}\n");

  styleLayoutMenu = Style.createAndInject(".header>.grid_button,.header>.list_button{display:none}.podcast_search{padding-right:40px !important}.podcast_search .clear_search{right:46px !important}.layouts,.layouts-menu .button{width:16px !important;height:16px !important;background-size:16px 16px !important;display:inline-block;cursor:pointer}.layouts{position:absolute;top:14px;right:12px !important}.layouts-menu{right:0;left:auto;padding:3px 5px 5px;min-width:0;width:90px}.layouts-menu .button{position:relative !important;top:2px !important;right:auto !important;float:left;margin:5px}.btn-layout.grid{background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48ZyBmaWxsPSIjOTc5Nzk3IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzk3OTc5NyI+PHBhdGggZD0iTTUwIDUwaDEwMHYxMDBINTB6TTIwMCA1MGgxMDB2MTAwSDIwMHpNMzUwIDUwaDEwMHYxMDBIMzUwek01MCAyMDBoMTAwdjEwMEg1MHpNMjAwIDIwMGgxMDB2MTAwSDIwMHpNMzUwIDIwMGgxMDB2MTAwSDM1MHpNNTAgMzUwaDEwMHYxMDBINTB6TTIwMCAzNTBoMTAwdjEwMEgyMDB6TTM1MCAzNTBoMTAwdjEwMEgzNTB6Ii8+PC9nPjwvc3ZnPg==')}.btn-layout.grid-small{background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NTAiIGhlaWdodD0iNjUwIj48ZyBmaWxsPSIjOTc5Nzk3IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzk3OTc5NyI+PHBhdGggZD0iTTUwIDUwaDEwMHYxMDBINTB6TTIwMCA1MGgxMDB2MTAwSDIwMHpNMzUwIDUwaDEwMHYxMDBIMzUwek01MDAgNTBoMTAwdjEwMEg1MDB6TTUwIDIwMGgxMDB2MTAwSDUwek0yMDAgMjAwaDEwMHYxMDBIMjAwek0zNTAgMjAwaDEwMHYxMDBIMzUwek01MDAgMjAwaDEwMHYxMDBINTAwek01MCAzNTBoMTAwdjEwMEg1MHpNMjAwIDM1MGgxMDB2MTAwSDIwMHpNMzUwIDM1MGgxMDB2MTAwSDM1MHpNNTAwIDM1MGgxMDB2MTAwSDUwMHpNNTAgNTAwaDEwMHYxMDBINTB6TTIwMCA1MDBoMTAwdjEwMEgyMDB6TTM1MCA1MDBoMTAwdjEwMEgzNTB6TTUwMCA1MDBoMTAwdjEwMEg1MDB6Ii8+PC9nPjwvc3ZnPg==')}.btn-layout.grid-tiny{background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIj48ZyBmaWxsPSIjOTc5Nzk3IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzk3OTc5NyI+PHBhdGggZD0iTTUwIDUwaDEwMHYxMDBINTB6TTIwMCA1MGgxMDB2MTAwSDIwMHpNMzUwIDUwaDEwMHYxMDBIMzUwek01MDAgNTBoMTAwdjEwMEg1MDB6TTY1MCA1MGgxMDB2MTAwSDY1MHpNNTAgMjAwaDEwMHYxMDBINTB6TTIwMCAyMDBoMTAwdjEwMEgyMDB6TTM1MCAyMDBoMTAwdjEwMEgzNTB6TTUwMCAyMDBoMTAwdjEwMEg1MDB6TTY1MCAyMDBoMTAwdjEwMEg2NTB6TTUwIDM1MGgxMDB2MTAwSDUwek0yMDAgMzUwaDEwMHYxMDBIMjAwek0zNTAgMzUwaDEwMHYxMDBIMzUwek01MDAgMzUwaDEwMHYxMDBINTAwek02NTAgMzUwaDEwMHYxMDBINjUwek01MCA1MDBoMTAwdjEwMEg1MHpNMjAwIDUwMGgxMDB2MTAwSDIwMHpNMzUwIDUwMGgxMDB2MTAwSDM1MHpNNTAwIDUwMGgxMDB2MTAwSDUwMHpNNjUwIDUwMGgxMDB2MTAwSDY1MHpNNTAgNjUwaDEwMHYxMDBINTB6TTIwMCA2NTBoMTAwdjEwMEgyMDB6TTM1MCA2NTBoMTAwdjEwMEgzNTB6TTUwMCA2NTBoMTAwdjEwMEg1MDB6TTY1MCA2NTBoMTAwdjEwMEg2NTB6Ii8+PC9nPjwvc3ZnPg==')}.btn-layout.list{background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48ZyBmaWxsPSIjOTc5Nzk3IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzk3OTc5NyI+PHBhdGggZD0iTTUwIDUwaDEwMHYxMDBINTB6TTIwMCA1MGgyNTB2MTAwSDIwMHpNNTAgMjAwaDEwMHYxMDBINTB6TTIwMCAyMDBoMjUwdjEwMEgyMDB6TTUwIDM1MGgxMDB2MTAwSDUwek0yMDAgMzUwaDI1MHYxMDBIMjAweiIvPjwvZz48L3N2Zz4=')}.btn-layout.list-small{background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NTAiIGhlaWdodD0iNjUwIj48ZyBmaWxsPSIjOTc5Nzk3IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzk3OTc5NyI+PHBhdGggZD0iTTUwIDUwaDEwMHYxMDBINTB6TTIwMCA1MGg0MDB2MTAwSDIwMHpNNTAgMjAwaDEwMHYxMDBINTB6TTIwMCAyMDBoNDAwdjEwMEgyMDB6TTUwIDM1MGgxMDB2MTAwSDUwek0yMDAgMzUwaDQwMHYxMDBIMjAwek01MCA1MDBoMTAwdjEwMEg1MHpNMjAwIDUwMGg0MDB2MTAwSDIwMHoiLz48L2c+PC9zdmc+')}.btn-layout.list-tiny{background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIj48ZyBmaWxsPSIjOTc5Nzk3IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iIzk3OTc5NyI+PHBhdGggZD0iTTUwIDUwaDEwMHYxMDBINTB6TTIwMCA1MGg1NTB2MTAwSDIwMHpNNTAgMjAwaDEwMHYxMDBINTB6TTIwMCAyMDBoNTUwdjEwMEgyMDB6TTUwIDM1MGgxMDB2MTAwSDUwek0yMDAgMzUwaDU1MHYxMDBIMjAwek01MCA1MDBoMTAwdjEwMEg1MHpNMjAwIDUwMGg1NTB2MTAwSDIwMHpNNTAgNjUwaDEwMHYxMDBINTB6TTIwMCA2NTBoNTUwdjEwMEgyMDB6Ii8+PC9nPjwvc3ZnPg==')}#content_left>.scrollable.grid.small .podcast{width:25%}#content_left>.scrollable.grid.tiny .podcast{width:20%}#content_left>.scrollable.list.small .podcast img{width:50px;height:50px}#content_left>.scrollable.list.small .podcast .podcast_text{width:274px;height:50px;padding:8px 10px}#content_left>.scrollable.list.small .podcast .podcast_text .title,#content_left>.scrollable.list.small .podcast .podcast_text .author{width:238px;line-height:18px}#content_left>.scrollable.list.tiny .podcast img{width:25px;height:25px}#content_left>.scrollable.list.tiny .podcast .podcast_text{width:299px;height:25px;padding:5px 6px}#content_left>.scrollable.list.tiny .podcast .podcast_text .title{width:238px;line-height:18px}#content_left>.scrollable.list.tiny .podcast .podcast_text .author{display:none}\n");


  /*
  Add the extra search functionality.
   */

  search = new Search();

  search.inject();


  /*
  Create the layout menu.
   */

  layouts = ['grid', 'grid small', 'grid tiny', 'list', 'list small', 'list tiny'];

  layout = new LayoutController(layouts);

  layout.inject();


  /*
  Page controller that other things can hook into.
   */

  pageController = new PageController();

  pageController.inject();

  $('body').data('pageController', pageController);


  /*
  Playlist controller.
   */

  playlistController = new PlaylistController(pageController);

  playlistController.inject();


  /*
  Create the menu.
   */

  menu = new Menu(pageController);

  menu.inject();

  buttonSaneMode = menu.createButton('user', 'Sane mode', 'Load everything, hide watched, order old -> new.', function() {
    pageController.setOrder(EpisodeOrder.DateOldNew);
    return pageController.loadAll(function() {
      return pageController.hideEpisodes(EpisodeSelector.Watched);
    });
  });

  buttonPlaylistMode = menu.createButton('play', 'Playlist mode', 'Auto-play the next episode.', function() {
    return playlistController.enabled = !playlistController.enabled;
  });

  buttonLoadMore = menu.createButton('tag', 'Load more', 'Load more episodes.', pageController.loadMore);

  buttonLoadAll = menu.createButton('tags', 'Load all', 'Load all episodes.', pageController.loadAll);

  dropShow = menu.createDropdown('eye-open', 'Show/hide', 'Show/hide episodes', [['eye-open', 'Show seen episodes', 'Show all seen episodes.', _.partial(pageController.showEpisodes, EpisodeSelector.Watched)], ['eye-close', 'Hide seen episodes', 'Hide all seen episodes.', _.partial(pageController.hideEpisodes, EpisodeSelector.Watched)]]);

  dropStats = menu.createDropdown('info-sign', 'Information', 'Stats about the current podcast.', [[null, menu.createEpisodeStats('Total episodes', 'total'), null, null], [null, menu.createEpisodeStats('Watched', 'watched'), null, null], [null, menu.createEpisodeStats('Unwatched', 'unwatched'), null, null]]);


  /*
  Watch the page for changes.
   */

  $(pageController).on('change', function() {
    menu.setState(this.page === Page.PODCAST, buttonSaneMode, dropShow, dropStats);
    menu.setState(this.page === Page.PODCAST && !this.podcastFullyLoaded, buttonLoadMore, buttonLoadAll);
    menu.setState((this.page === Page.PODCAST && this.playerScope.isPlaying()) || playlistController.enabled, buttonPlaylistMode);
    menu.setButton(buttonPlaylistMode, playlistController.enabled ? 'pause' : 'play');
    menu.setEpisodeStats('total', $(EpisodeSelector.All));
    menu.setEpisodeStats('watched', $(EpisodeSelector.Watched));
    return menu.setEpisodeStats('unwatched', $(EpisodeSelector.Unwatched));
  });


  /*
  Settings.
   */

  settings = new SettingsController();

  settings.inject();

  settings.getAndUpdateVersion();

  group = settings.addGroup({
    key: 'self',
    title: 'Pocketcast Utils Settings',
    description: 'Settings that affect the behavior of Pocketcast Utils only.'
  });

  group.addSetting({
    key: 'showOnUpdate',
    title: 'Show on update',
    description: 'Show this screen when there are new, exciting features.',
    callback: function(state) {
      return settings.isShowOnUpdateEnabled = state;
    },
    version: [1, 6, 6]
  });

  group.addSetting({
    key: 'newSubtle',
    title: 'More subtle new markings',
    description: 'Make the markings showing which settings are new more subtle.',
    callback: function(state) {
      return styleNewSubtle.setState(state);
    },
    version: [1, 6, 6],
    "default": false
  });

  group = settings.addGroup({
    key: 'tweaks',
    title: 'Tweaks',
    description: 'Tweaks on default functionalities/page elements.'
  });

  group.addSetting({
    key: 'header',
    title: 'Hide the header',
    description: 'Hide the default header, creating more screen space.',
    callback: function(state) {
      return styleHeader.setState(state);
    },
    version: [1, 5, 0],
    "default": false
  });

  group.addSetting({
    key: 'search',
    title: 'Episode search',
    description: "Let the search box also filter the currently loaded episodes' titles and descriptions.",
    callback: function(state) {
      return search.enabled = state;
    },
    version: [1, 3, 1]
  });

  group.addSetting({
    key: 'layouts',
    title: 'Extra layouts',
    description: 'Extra layouts for the podcast list in the sidebar.',
    callback: function(state) {
      return styleLayoutMenu.setState(state);
    },
    version: [1, 7, 0]
  });

  group = settings.addGroup({
    key: 'menu_default',
    title: 'Default menu',
    description: 'Tweaks on the default menu.'
  });

  group.addSetting({
    key: 'compact_menu',
    title: 'Compact',
    description: 'Make the default menu buttons more compact.',
    callback: function(state) {
      return styleCompactMenu.setState(state);
    },
    version: [1, 6, 0]
  });

  menuItems = [['Discover', [1, 6, 4]], ['New Releases', [1, 6, 4]], ['In Progress', [1, 6, 4]], ['Starred', [2, 0, 0]]];

  for (_i = 0, _len = menuItems.length; _i < _len; _i++) {
    _ref = menuItems[_i], name = _ref[0], version = _ref[1];
    key = name.toLowerCase().replace(' ', '_');
    $menuElem = $(".section_" + key);
    group.addSetting({
      key: key,
      title: name,
      description: 'Show this menu button',
      callback: _.bind(jQuery.fn.toggle, $menuElem),
      version: version
    });
  }

  group = settings.addGroup({
    key: 'menu_extra',
    title: 'Extra menu',
    description: 'Tweaks on default functionalities/page elements.'
  });

  menuItems = [[buttonSaneMode, [1, 0, 0], true], [buttonPlaylistMode, [1, 4, 0], true], [buttonLoadMore, [0, 2, 0], false], [buttonLoadAll, [0, 2, 0], false], [dropShow, [1, 1, 0], false], [dropStats, [1, 2, 0], true]];

  for (_j = 0, _len1 = menuItems.length; _j < _len1; _j++) {
    _ref1 = menuItems[_j], $element = _ref1[0], version = _ref1[1], def = _ref1[2];
    group.addSetting({
      key: $element.data('cls'),
      title: $element.data('title'),
      description: "Show this menu button (function: " + ($element.data('description')) + ")",
      callback: _.bind(jQuery.fn.toggle, $element),
      version: version,
      "default": def
    });
  }

  settings.showIfNew();

}).call(this);

//# sourceMappingURL=PocketcastsUtils.coffee.js.map
