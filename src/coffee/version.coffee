###
Version comparison.
###

class Version
    @parts = []

    # Create a new version object.
    # 
    # This allows either a list of version parts, or a version string.
    constructor: () ->
        if arguments.length > 1
            @parts = arguments
        else if _.isArray(arguments[0])
            @parts = arguments[0];
        else if _.isUndefined(arguments[0])
            @parts = [];
        else
            @parts = _.chain((arguments[0] + '').split(','))
                .map((p) -> return p.split('.') )
                .flatten()
                .map((p) -> return +p )
                .without(NaN)
                .value()

    # Convert the version to a string.
    #
    # It's a bit of a weird string, but it's comparable, which is it's primary purpose.
    toString: () ->
        return _.map(@parts, _.partial(Utils.padLeft, _, 3, '0')).toString()

    # Convert the version to a human readable string.
    toUsefulString: () ->
        return @parts.toString().replace(/,/g, '.')
