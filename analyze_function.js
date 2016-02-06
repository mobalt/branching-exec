
var analyzeFn = (function analyzeFn() {
    var cleanLocalExpression = /(?:\([^()]*\))|(?:=[^,;]+)/g,
        parameters = /\s*,\s*/g,
        main = /^\s*function\s*([a-z$_][a-z0-9$_]*)?\s*\(([^)]*)+\)\s*\{\s*([\s\S]*)\s*}/i,
        comments = /(?:\/\/.*)|(?:\/\*[\s\S]*\*\/)/g,
        literals = /(?:'[^'\n]*?(?:\\'[^'\n]*)*')|(?:"[^"\n]*?(?:\\"[^"\n]*)*")/g,
        allWords = /[\s\(,{};|&<>=]([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        easyWords = /([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        definitions = /var ([\s\S]+?);/g,
        allThis = /\bthis\.([a-zA-Z0-9$_]+)/g,
        keywords = {
            'break': 1,
            'case': 1,
            'class': 1,
            'catch': 1,
            'const': 1,
            'continue': 1,
            'debugger': 1,
            'default': 1,
            'delete': 1,
            'do': 1,
            'else': 1,
            'export': 1,
            'extends': 1,
            'finally': 1,
            'for': 1,
            'function': 1,
            'if': 1,
            'import': 1,
            'in': 1,
            'instanceof': 1,
            'new': 1,
            'return': 1,
            'super': 1,
            'switch': 1,
            'this': 1,
            'throw': 1,
            'try': 1,
            'typeof': 1,
            'var': 1,
            'void': 1,
            'while': 1,
            'with': 1,
            'yield': 1
        };


    return function analyzeFn(fn) {
        var result, result2, code;

        result = main.exec(fn.toString());
        var variables = {
            name: result[1],
            arguments: result[2].split(parameters),
            code: result[3]
        };

        code = result[3]
            .replace(comments, '')
            .replace(literals, '');


        //get all local definitions
        var local_variables = {};
        while (result = definitions.exec(code)) {
            result = result[1];
            // clean out excess
            while ((result2 = result.replace(cleanLocalExpression, '')) && result2 !== result)
                result = result2;

            // get variables
            while (result2 = easyWords.exec(result))
                if (!keywords[result2[1]])
                    local_variables[result2[1]] = 1;
        }
        variables.local = Object.keys(local_variables);

        // global variables
        var global_variables = {};
        while (result = allWords.exec(code))
            if (!keywords[result[1]] && !local_variables[result[1]] && !~variables.arguments.indexOf(result[1]))
                global_variables[result[1]] = 1;
        variables.global = Object.keys(global_variables);

        //this.variables
        var this_variables = {};
        while (result = allThis.exec(code))
            this_variables[result[1]] = 1;
        variables.this = Object.keys(this_variables);


        return variables;
    }
})();
