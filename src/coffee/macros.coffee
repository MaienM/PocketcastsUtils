#
# Macros
#

# Macro to load a file as text.
#
# @param fn  [String]  The path of the file to load as text.
# @return    [String]  The contents of the file.
macro load (fn) ->
    fn = macro.nodeToVal(fn)
    macro.valToNode('' + macro.require('fs').readFileSync(fn))

# Macro to directly import a file, unless it's already been imported.
#
# @param fn  [String]  The path of the file to import.
macro include_once (fn) ->
    fn = macro.nodeToVal(fn)
    this.included = [] unless this.included?
    if fn not in this.included
        this.included.push(fn)
        macro.fileToNode('src/coffee/' + fn + '.coffee')
