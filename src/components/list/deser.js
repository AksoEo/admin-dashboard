import Sorting from './sorting';
import * as actions from './actions';

// PARENTHESIS ENCODING
//
// Simple human-readable url-safe context-free string delimiter that puts as many parentheses on
// either side as necessary until the entire string is wrapped.
//
// Encoding begins with a variable number of ( and is closed with the same number of ) in a row.
// If the string begins with a ( itself, then a * is prepended. The first * after the opening
// parentheses is always ignored.
//
// Also, # is encoded as @h and @ is encoded as @@.
function encodeParens (str) {
    let parens = 1;

    if (str.startsWith('*') || str.startsWith('(')) {
        str = '*' + str;
    }

    str = str.replace(/@/g, '@@').replace(/#/g, '@h');

    let streak = 0;
    for (const c of str) {
        if (c === ')') streak++;
        else streak = 0;
        parens = Math.max(parens, streak + 1);
    }

    return '('.repeat(parens) + str + ')'.repeat(parens);
}
// Returns an array: [string, length of parentheses encoding]. Ignores the rest
function decodeParens (str) {
    let cursor = 0;
    let parens = 0;
    while (str[cursor] === '(') {
        cursor++;
        parens++;
    }
    if (str[cursor] === '*') cursor++;
    const headerSize = cursor;

    let streak = 0;
    while (cursor < str.length) {
        if (str[cursor] === ')') streak++;
        else streak = 0;
        cursor++;
        if (streak === parens) {
            break;
        }
    }
    const decoded = str.substring(headerSize, cursor - parens)
        .replace(/@h/g, '#')
        .replace(/@@/g, '@');
    return [decoded, cursor];
}

// Will only use parenthesis encoding if the string is deemed unsafe
function maybeEncodeParens (str, unsafeChars) {
    if (str.startsWith('(')) return encodeParens(str);
    for (const c of unsafeChars) if (str.includes(c)) return encodeParens(str);
    return str;
}
function maybeDecodeParens (str, unsafeChars) {
    if (str.startsWith('(')) {
        return decodeParens(str);
    } else {
        let s = '';
        for (const c of str) {
            if (unsafeChars.includes(c)) {
                break;
            }
            s += c;
        }
        return [s, s.length];
    }
}

function serializeFilterValue (value) {
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean' || typeof value === 'number') return value.toString();
    if (typeof value === 'undefined' || value === null) return '';
    throw new Error(`can’t serialize value of type ${typeof value} automatically`);
}
function deserializeFilterValue (value) {
    if (value === '') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if ((+value).toString() === value) return +value;
    return value;
}

/// Returns an encoded string.
export function encodeURLQuery (state, filters) {
    let data = '';
    if (state.search.query) {
        // search(field, query)
        data += 'search(';
        data += maybeEncodeParens(state.search.field, ',)');
        data += ',';
        data += maybeEncodeParens(state.search.query, ')');
        data += ')';
    }
    if (state.jsonFilter.enabled) {
        // jsonFilter(data)
        data += 'jsonFilter(';
        data += encodeParens(state.jsonFilter.filter);
        data += ')';
    } else if (state.filters.enabled) {
        // filter(id:serialized, ...)
        data += 'filter(';
        let count = 0;
        for (const id in state.filters.filters) {
            if (!state.filters.filters[id].enabled) continue;
            if (count) data += ',';
            count++;
            data += maybeEncodeParens(id, ':),');
            data += ':';
            const serialized = filters[id].serialize
                ? filters[id].serialize(state.filters.filters[id].value)
                : serializeFilterValue(state.filters.filters[id].value);
            data += maybeEncodeParens(serialized, ':),');
        }
        data += ')';
    }
    {
        // fields(field:sorting, ...)
        data += 'fields(';
        let count = 0;
        for (const field of state.fields.user) {
            if (count) data += ',';
            count++;
            data += maybeEncodeParens(field.id, ':),');
            if (field.sorting !== Sorting.NONE) {
                data += ':';
                data += maybeEncodeParens(field.sorting, ':),');
            }
        }
        data += ')';
    }
    {
        // page(page, itemsPerPage)
        data += 'page(' + state.list.page + ',' + state.list.itemsPerPage + ')';
    }
    return data;
}

/// Decodes and returns a series of redux actions.
export function decodeURLQuery (data, filters) {
    const cmds = [];
    while (data.length) {
        const section = data.match(/^(\w+)\(/);
        if (!section) throw new Error('invalid section header');
        data = data.substr(section[0].length);
        if (section[1] === 'search') {
            const [field, fieldLen] = maybeDecodeParens(data, ',)');
            data = data.substr(fieldLen + 1); // ,
            const [query, queryLen] = maybeDecodeParens(data, ')');
            data = data.substr(queryLen);
            cmds.push(actions.setSearchField(field));
            cmds.push(actions.setSearchQuery(query));
        } else if (section[1] === 'jsonFilter') {
            const [filter, len] = decodeParens(data);
            data = data.substr(len);
            cmds.push(actions.setJSONFilterEnabled(true));
            cmds.push(actions.setJSONFilter(filter));
        } else if (section[1] === 'filter') {
            while (data.length) {
                const [id, idLen] = maybeDecodeParens(data, ':),');
                data = data.substr(idLen + 1); // :
                const [serialized, serLen] = maybeDecodeParens(data, ':),');
                data = data.substr(serLen);

                const value = filters[id]
                    ? filters[id].deserialize(serialized)
                    : deserializeFilterValue(serialized);

                cmds.push(actions.setFilterEnabled(id));
                cmds.push(actions.setFilterValue(id, value));

                if (data[0] !== ',') break;
                else data = data.substr(1);
            }
        } else if (section[1] === 'fields') {
            cmds.push(actions.setUserFields([]));
            while (data.length) {
                const [id, idLen] = maybeDecodeParens(data, ':),');
                data = data.substr(idLen);

                cmds.push(actions.addField(id));

                if (data[0] === ':') {
                    data = data.substr(1);
                    const [sorting, sortingLen] = maybeDecodeParens(data, ':),');
                    data = data.substr(sortingLen);

                    cmds.push(actions.setFieldSorting(id, sorting));
                }

                if (data[0] !== ',') break;
                else data = data.substr(1);
            }
        } else if (section[1] === 'page') {
            const match = data.match(/^(\d+),(\d+)/);
            if (!match) throw new Error('bad page section');
            data = data.substr(match[0].length);

            cmds.push(actions.setPage(+match[1]));
            cmds.push(actions.setItemsPerPage(+match[2]));
        } else {
            throw new Error(`unknown section ${section[1]}`);
        }
        if (data[0] !== ')') throw new Error('section did not end with )');
        data = data.substr(1); // )
    }
    return cmds;
}
