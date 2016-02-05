var is = {
    type: {
        UNDEFINED: 0,
        NULL: 1,
        BOOLEAN: 4,
        NUMBER: 8,
        STRING: 16,
        FUNCTION: 32,
        ARRAY: 64,
        OBJECT: 128,
        SPECIAL: 256
    },
    UNDEFINED: 0,
    DEFINED: 1,
    TRUTHY: 2
};

/**
 * 0 = undefined
 * 1 = defined (if x==1, then null. if 1 & x, then defined)
 * 2 = Truthy ( defined and ( non-null, true, non-zero, non-empty))
 * 4 = boolean type. Value given via bit 2
 * 8 = number type
 * 16 = string type
 * 32 = function type. if x.name == 'empty', then bit 2 = false
 * 64 = array type
 * 128 = object type
 * 256 = special type (ie, a non-plain object)
 * @param {*} unknown Unknown object whose properties need to be determined.
 * @returns {number}
 */
function getType(unknown) {
    // Simple Primitives
    switch (unknown) {
        case undefined:
            return is.type.UNDEFINED;
        case null:
            return is.type.NULL;
    }

    // Simple Non-primitives
    switch (typeof unknown) {
        case 'boolean':
            return is.DEFINED | is.type.BOOLEAN | (unknown == true) << 1;

        case 'number':
            return is.DEFINED | is.type.NUMBER | (unknown != 0) << 1;

        case 'string':
            return is.DEFINED | is.type.STRING | (unknown != '') << 1;

        case 'function':
            return is.DEFINED | is.type.FUNCTION | (!!unknown.name && unknown.name.toLowerCase() != 'empty') << 1;
    }

    // Complex (typeof == 'object')
    switch (unknown.constructor) {

        // {}
        case Object.prototype.constructor:
            return is.DEFINED | is.type.OBJECT | (Object.keys(unknown).length != 0) << 1;

        // []
        case Array.prototype.constructor:
            return is.DEFINED | is.type.ARRAY | (unknown.length != 0) << 1;

        // instance of a prototype
        // Note: to determine truthiness, if the prototype has 'isTrue' function, then it is called
        //      otherwise the object is just assumed to be true. Not ideal, but what can you do?
        default :
            return is.DEFINED | is.type.SPECIAL | ('isTrue' in unknown == false || unknown['isTrue']()) << 1;

    }
}
