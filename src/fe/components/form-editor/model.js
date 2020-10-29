//! Form editor model stuff.
import { evaluate } from '@tejo/akso-script';

/// Creates an input item of the given type.
export function createInput (type) {
    let extra = {};
    if (type === 'number') extra = {
        variant: 'input',
        placeholder: null,
        step: null,
        min: null,
        max: null,
    };
    else if (type === 'text') extra = {
        placeholder: null,
        pattern: null,
        patternError: null,
        minLength: null,
        maxLength: null,
        variant: 'text',
        chAutofill: null,
    };
    else if (type === 'money') extra = {
        placeholder: null,
        step: null,
        min: null,
        max: null,
        currency: 'USD',
    };
    else if (type === 'enum') extra = {
        options: [],
        variant: 'select',
    };
    else if (type === 'country') extra = {
        add: [],
        exclude: [],
        chAutofill: null,
    };
    else if (type === 'date') extra = {
        min: null,
        max: null,
        chAutofill: null,
    };
    else if (type === 'time') extra = {
        min: null,
        max: null,
    };
    else if (type === 'datetime') extra = {
        tz: null,
        min: null,
        max: null,
    };
    else if (type === 'boolean_table') extra = {
        cols: 1,
        rows: 1,
        minSelect: null,
        maxSelect: null,
        headerTop: null,
        headerLeft: null,
        excludeCells: null,
    };

    return {
        el: 'input',
        type,
        name: '',
        label: '',
        description: null,
        default: null,
        required: false,
        disabled: false,
        editable: true,
        ...extra,
    };
}

const MAX_EVAL_INVOCATIONS = 4096;
export function evalExpr (expr, previousNodes) {
    if (!expr) return undefined;

    const defs = [];
    const formVars = {};
    if (previousNodes) {
        for (const item of previousNodes) {
            if (!item) continue;
            defs.push(item.defs);
            for (const fv of item.formVars) {
                formVars[fv.name] = fv.value;
            }
        }
    }
    const key = Symbol('eval result');
    defs.push({ [key]: expr });

    let invocations = 0;
    let result = undefined;
    try {
        result = evaluate(defs, key, id => (id in formVars) ? formVars[id] : null, {
            shouldHalt: () => {
                invocations++;
                return invocations > MAX_EVAL_INVOCATIONS;
            },
        });
    } catch (err) {
        console.debug(err); // eslint-disable-line no-console
    }

    return result;
}

export function getGlobalDefs (additionalVars) {
    return {
        defs: {},
        formVars: [
            {
                name: '@created_time',
                type: 'timestamp',
                value: new Date(),
            },
            {
                name: '@edited_time',
                type: 'timestamp',
                value: new Date(),
            },
            ...(additionalVars || []),
        ],
    };
}

/// Returns all AKSO Script definitions in the given item and its value (if applicable).
///
/// Will return { defs: script defs, formVars: form vars object { [name]: { type, value } } }
///
/// Form vars are in the same format as the ASC Editor
export function getAscDefs (item, value) {
    if (item.el === 'script') {
        return { defs: item.script, formVars: [] };
    } else if (item.el === 'input') {
        let type = 'u';
        if (value === null || value === undefined) type = 'u';
        else if (item.type === 'boolean') {
            type = 'b';
        } else if (item.type === 'number') {
            type = 'n';
        } else if (item.type === 'text') {
            type = 's';
        } else if (item.type === 'money') {
            type = 'n';
        } else if (item.type === 'enum') {
            type = 's';
        } else if (item.type === 'country') {
            type = 's';
        } else if (item.type === 'date') {
            type = 's';
        } else if (item.type === 'time') {
            type = 's';
        } else if (item.type === 'datetime') {
            type = 'timestamp'; // TODO: support this
        } else if (item.type === 'boolean_table') {
            type = 'm';
        }

        return { defs: {}, formVars: [{ name: item.name, type, value }] };
    }
}
