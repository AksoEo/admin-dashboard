import { notifTemplateIntentExamples as examples } from '../../../locale';

const NULL = 'u';
const BOOL = 'b';
const NUMBER = 'n';
const STRING = 's';

export function getFormVarsForIntent (intent) {
    if (intent === 'codeholder') return spec2Vars(CODEHOLDER_SPEC);
    else if (intent === 'newsletter') return spec2Vars(CODEHOLDER_SPEC);
    return [];
}

function spec2Vars (spec) {
    const vars = [];
    const visit = (node, name = '') => {
        if (typeof node === 'object') {
            for (const k in node) {
                visit(node[k], name + (name ? '.' : '') + k);
            }
        } else {
            const value = node;
            let type = NULL;
            if (typeof value === 'boolean') type = BOOL;
            else if (typeof value === 'number') type = NUMBER;
            else if (typeof value === 'string') type = STRING;
            vars.push({ name, type, value });
        }
    };
    visit(spec);
    return vars;
}

const CODEHOLDER_SPEC = {
    codeholder: examples.codeholder,
};
