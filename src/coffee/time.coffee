###
Time related functions.
###

# Class that parses, combines and formats time.
class Time
    # The number of seconds in a minute.
    @TIME_MINUTE: 60

    # The number of seconds in an hour.
    @TIME_HOUR: 60 * @TIME_MINUTE

    # The number of seconds in a day.
    @TIME_DAY: 24 * @TIME_HOUR

    # The number of seconds in a week.
    @TIME_WEEK: 7 * @TIME_DAY

    # The number of seconds in this time object.
    seconds: 0

    # Create a new time object, containing the combined time of all given episodes.
    #
    # @param elems  [Array]    A (selector for a) list of jQuery objects for episodes.
    constructor: (elems) ->
        @seconds = 0
        @seconds += parseInt($(elem).scope().episode.duration) for elem in elems

    # Format the time into a short format: HH:MM.
    #
    # @return         [String]   A string representing the time.
    formatShort: () ->
        hours = Math.floor(@seconds / Time.TIME_HOUR)
        minutes = Math.floor((@seconds % Time.TIME_HOUR) / Time.TIME_MINUTE)
        return "#{hours}:#{Utils.padLeft(minutes, 2, '0')}"

    # Format the time into a long format: W weeks, D days, H hours, M minutes, S seconds.
    #
    # @return         [String]   A string representing the time.
    formatLong: () ->
        # Split the number into weeks, days, hours, minutes and seconds.
        weeks = Math.floor(@seconds / Time.TIME_WEEK)
        days = Math.floor((@seconds % Time.TIME_WEEK) / Time.TIME_DAY)
        hours = Math.floor((@seconds % Time.TIME_DAY) / Time.TIME_HOUR)
        minutes = Math.floor((@seconds % Time.TIME_HOUR) / Time.TIME_MINUTE)
        seconds = @seconds % Time.TIME_MINUTE

        # Format a string for each of these parts.
        part = (num, text) ->
            return "#{num} #{text}" if num == 1
            return "#{num} #{text}s" if num > 2
        parts = [
            part(weeks, 'week'),
            part(days, 'day'),
            part(hours, 'hour'),
            part(minutes, 'minute'),
            part(seconds, 'second'),
        ]

        # Show all non-empty parts.
        return _.filter(parts).join(', ')
