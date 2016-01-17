###
Some core functions that are used throughout the program.
###

class Utils
    # Helper method that, given an argument that may or may not be a function, calls it if it is a function.
    #
    # @param callback  [Function?]  The maybe/maybe not function.
    # @return          [Object]     The return value, if any.
    @doCallback = (callback) ->
        return callback() if typeof callback == 'function'

    # Method that does nothing.
    @noop = () -> undefined

    # Left pad a thing to be at least certain length
    @padLeft = (input, width, padding = ' ') ->
        input = input.toString()
        padding = padding.toString()
        throw "width must be > 0" unless width > 0
        throw "padding must be exactly 1 character" unless padding.length == 1
        input = padding + input while input.length < width
        return input
