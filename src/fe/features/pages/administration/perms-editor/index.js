import { h, Component } from 'preact';
import { useRef } from 'preact/compat';
import { Checkbox } from '@cpsdqs/yamdl';
import { spec } from '../../../../permissions';
import { read, add, remove } from './solver';
import './style';

// TODO: member fields stuff

/// Permissions editor.
/// Also edits member filter and member fields.
///
/// # Props
/// - permissions: list of granted permissions
/// - memberFilter: member filter (may be none)
/// - memberFields: member fields (may be none)
export default class PermsEditor extends Component {
    state = {
        showImplied: new Set(),
    };

    #node = null;

    render ({ permissions, onChange }) {
        const [permStates, unknown] = read(permissions);

        const ctx = {
            states: permStates,
            showImplied: this.state.showImplied,
            setShowImplied: (implied, targetRect) => {
                this.setState({
                    showImplied: implied || new Set(),
                });
            },
            togglePerm: perm => {
                if (permStates.get(perm).active) {
                    onChange(remove(permissions, perm));
                } else {
                    onChange(add(permissions, perm));
                }
            },
        };

        const unknownPerms = unknown.map(perm => (
            <PermsItem key={perm} item={{ type: 'perm', name: perm, id: perm }} ctx={ctx} />
        ));

        return (
            <div class="perms-editor" ref={node => this.#node = node}>
                {spec.map((x, i) => <PermsItem item={x} key={i} ctx={ctx} />)}
                {unknownPerms}
            </div>
        );
    }
}

function PermsItem ({ item, ctx }) {
    if (item.requires) {
        for (const req of item.requires) {
            if (!ctx.states.get(req).active) return null;
        }
    }
    if (item.type === 'category' || item.type === 'group') {
        const className = item.type === 'category' ? 'perms-category' : 'perms-group';
        return (
            <div class={className}>
                {item.name ? <div class="group-title">{item.name}</div> : null}
                {item.children.map((x, i) => <PermsItem key={i} item={x} ctx={ctx} />)}
            </div>
        );
    } else if (item.type === 'switch') {
        return (
            <div class="perms-switch">
                {item.name ? <span class="switch-name">{item.name}</span> : <span class="spacer" />}
                <div class="switch-options">
                    {item.options.map((opt, i) => {
                        const state = ctx.states.get(opt.id);
                        let className = 'perm-checkbox';
                        if (state.active && state.impliedBy.size) className += ' is-implied-active';
                        if (ctx.showImplied.has(opt.id)) {
                            className += ' is-implier';
                        }

                        return (
                            <span class="switch-option" key={i}>
                                <Checkbox
                                    class={className}
                                    checked={state.active}
                                    onMouseOver={e => ctx.setShowImplied(state.impliedBy)}
                                    onMouseOut={() => ctx.setShowImplied(null)}
                                    onClick={() => ctx.togglePerm(opt.id)} />
                                <span class="switch-option-label">{opt.name}</span>
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    } else if (item.type === 'perm') {
        const state = ctx.states.get(item.id);
        let className = 'perm-checkbox';
        if (state.active && state.impliedBy.size) className += ' is-implied-active';
        if (ctx.showImplied.has(item.id)) {
            className += ' is-implier';
        }

        return (
            <div class="perms-perm">
                <Checkbox
                    class={className}
                    checked={state.active}
                    onMouseOver={e => ctx.setShowImplied(state.impliedBy)}
                    onMouseOut={() => ctx.setShowImplied(null)}
                    onClick={() => ctx.togglePerm(item.id)} />
                {item.name}
            </div>
        );
    } else if (item === '!memberFieldsEditor') {
        return 'member fields editor goes here';
    } else if (item === '!memberFilterEditor') {
        return 'member filter editor goes here';
    }
    return 'unknown perms spec type ' + item.type;
}
