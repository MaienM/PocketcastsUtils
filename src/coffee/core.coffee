###
Some core functions that are used throughout the program.
###

# Helper method that, given an argument that may or may not be a function, calls it if it is a function.
#
# @param callback  [Function?]  The maybe/maybe not function.
# @return          [Object]     The return value, if any.
doCallback = (callback) ->
    return callback() if typeof callback == 'function'

# Method that does nothing.
noop = () -> undefined
