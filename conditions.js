/**
 * @typedef {object} ActionsObj
 * @property {string} action The marker to go to
 * @property {string} result How to process this result. Options: map, single, ignore
 * @property {*} value Overrides the value that was initially passed to parent
 * @property {string} status
 * @property {string} cancel Determines whether to cancel all unfinished children, and clean up finished children
 */
/**
 * @typedef {object} ConditionObj
 * @property {number|number[]|boolean} count The number of times `end` needs to be reached. If "true", then an amount equal to `length` needs to be reached.
 * @property {number|number[]|boolean} n Index of this item, within parent's list of children
 * @property {number|number[]|boolean} i Index, ie it's `n` value, of child currently being run. Also number of times this flow has passed `start` marker
 * @property {number|number[]|boolean} attempt Number of times this flow has gone through `enter` marker, ie complete loop
 * @propety {string|string[]} status
 *
 */
/**
 * @typedef {object} ConditionStructureObj
 * @property {ConditionObj|ConditionObj[]|boolean} enter
 * @property {ConditionObj|ConditionObj[]|boolean} start
 * @property {ConditionObj|ConditionObj[]|boolean} end
 * @property {ConditionObj|ConditionObj[]|boolean} exit
 * @property {ConditionObj|ConditionObj[]} if
 * @property {ActionsObj|ConditionStructureObj} then
 * @property {ActionsObj|ConditionStructureObj} else
 */
/**
 * Creates the base conditions for different flow types
 * @param {string} next The action that should be run upon `end` when status != 'cancel' and count != length
 * @param {string} defaultResult The `result` action upon `end` when status != 'fail'
 * @returns {ConditionStructureObj[]}
 */
function baseConditions(next, defaultResult) {
    return [
        {
            end: {status: 'fail'},
            then: {result: 'ignore'},
            else: {result: defaultResult}
        },
        {
            end: [{status: 'cancel'}, {count: true}],
            then: {action: 'exit'},
            else: {action: next}
        },
        {
            exit: {status: ['cancel', 'fail']},
            enter: {status: ['cancel']},
            then: {
                action: 'parent end',
                status: 'fail',
                cancel: true,
                result: 'ignore'
            }
        },
        {
            exit: true,
            then: {action: 'parent end'}
        }
    ]
}
function convertConditionsToArray(options) {
    var results = {}, op, marker, markers;
    for (var i = 0; i < options.length; i++) {
        op = deepConditionStructure(options[i]);
        markers = op[3];

        if (!op[3]) continue;

        for (marker in markers) {
            if (marker in results == false)
                results[marker] = [];

            results[marker].push([markers[marker], op[1], op[2]]);
        }
    }
    return results;
}
function deepConditionStructure(obj) {
    if (!obj || !obj.then && !obj.else)
        return obj;

    var others = {}, include;
    for (var prop in obj)
        switch (prop) {
            case 'if':
            case 'then':
            case 'else':
                break;
            default:
                include = true;
                others[prop] = obj[prop];
        }
    return [obj.if, deepConditionStructure(obj.then), deepConditionStructure(obj.else), include && others, obj.action];
}

var defaults = {
    parallel: baseConditions(wait, 'map'),
    race: baseConditions(exit, 'single'),
    loop: baseConditions(nextFn, 'single'),
    serial: baseConditions(nextFn, 'single'),
    map: baseConditions(wait, 'map'),
    reduce: baseConditions(nextItem, 'single')
};
defaults.loop.unshift([{status: 'fail'}, {action: 'enter', cancel: true}]);
