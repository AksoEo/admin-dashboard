import {
    Decoration,
    EditorView,
    ViewPlugin,
    WidgetType,
} from '@codemirror/view';
import { data as locale } from '../locale';
import './cm-templating.less';

// template markings: additional syntax highlighting for notif template variables
export class TemplateMarkingWidget extends WidgetType {
    constructor (varNames, expr) {
        super();
        this.varNames = varNames;
        this.expr = expr;
    }

    eq (other) {
        return this.expr === other.expr;
    }

    toDOM () {
        const node = document.createElement('span');
        node.className = 'akso-cm-template-marked-atom';

        const contents = this.expr;
        if (contents.startsWith('@')) {
            node.className += ' is-form-var';
            node.textContent = this.varNames[contents.substr(1)];
        } else {
            node.className += ' is-script-var';
            node.textContent = contents;
        }

        return node;
    }
}

const HANDLEBARS_CHARACTERS = '#/';

// inline errors & template markings
export function decoTemplateMarkings (varNames, knownVars, view) {
    const markings = [];

    for (let ln = 1; ln <= view.state.doc.lines; ln++) {
        const line = view.state.doc.line(ln);

        let error = null;
        let errorRange = null;

        let remaining = line.text;
        let ch = 0;
        while (remaining) {
            const m = remaining.match(/\{\{(.*?)\}\}/);
            if (m) {
                ch += m.index;
                const templateRange = [line.from + ch, line.from + ch + m[0].length];

                const contents = m[1];
                if (!HANDLEBARS_CHARACTERS.includes(contents[0])) {
                    if (!knownVars.has(contents)) {
                        error = locale.mdEditor.templating.unknownVar(contents);
                        errorRange = templateRange;
                        break;
                    }
                }

                remaining = remaining.substr(m.index + m[0].length);
                ch += m[0].length;

                const deco = Decoration.replace({
                    widget: new TemplateMarkingWidget(varNames, contents),
                });

                markings.push(deco.range(templateRange[0], templateRange[1]));
            } else {
                break;
            }
        }

        if (error) {
            const markDec = Decoration.mark({
                class: 'akso-cm-template-error-mark',
            });
            markings.push(
                markDec.range(
                    errorRange[0],
                    errorRange[1],
                ),
            );
        }
    }

    markings.sort((a, b) => a.from - b.from);

    return Decoration.set(markings);
}

export const templateMarkings = (varNames, getKnownVars) => ViewPlugin.fromClass(class {
    constructor (view) {
        this.markings = decoTemplateMarkings(varNames, getKnownVars(), view);
    }
    update (update) {
        if (update.docChanged || update.viewportChanged) {
            this.markings = decoTemplateMarkings(varNames, getKnownVars(), update.view);
        }
    }
}, {
    decorations: instance => instance.markings,
    provide: plugin => EditorView.atomicRanges.of(view => {
        return view.plugin(plugin)?.markings || Decoration.none;
    }),
});
