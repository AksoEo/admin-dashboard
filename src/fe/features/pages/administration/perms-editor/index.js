import { h, Component } from 'preact';
import { Checkbox } from '@cpsdqs/yamdl';
import {
    spec,
    memberFields as fieldsSpec,
    memberFieldsAll,
    memberFieldsRead,
    memberFieldsWrite,
} from '../../../../permissions';
import JSONFilterEditor from '../../../../components/json-filter-editor';
import { read, add, remove, hasField, addField, removeField } from './solver';
import './style';

// TODO: member fields stuff

/// Permissions editor.
/// Also edits member filter and member fields.
///
/// # Props
/// - permissions: list of granted permissions
/// - memberFilter: member filter (may be none)
/// - memberFields: member fields (may be none)
/// - editable: if false, will not show as editable
export default class PermsEditor extends Component {
    state = {
        showImplied: null,
        // if true, will show raw perm ids
        showRaw: false,
    };

    #node = null;

    render ({
        permissions,
        memberFields,
        memberFilter,
        memberRestrictionsEnabled,
        onChange,
        onFieldsChange,
        onFilterChange,
        onMemberRestrictionsEnabledChange,
        editable,
    }, { showRaw }) {
        const [permStates, unknown] = read(permissions);

        const ctx = {
            showRaw,
            editable,
            states: permStates,
            showImplied: this.state.showImplied && permStates.has(this.state.showImplied)
                ? permStates.get(this.state.showImplied).impliedBy
                : new Set(),
            setShowImplied: implied => this.setState({ showImplied: implied }),
            togglePerm: perm => {
                if (permStates.get(perm).active) {
                    const [p, m] = remove(permissions, memberFields, perm);
                    onChange(p);
                    onFieldsChange(m);
                } else {
                    const [p, m] = add(permissions, memberFields, perm);
                    onChange(p);
                    onFieldsChange(m);
                }
            },
            memberFields,
            toggleField: (field, perm) => {
                if (hasField(memberFields, field, perm)) {
                    const [p, m] = removeField(permissions, memberFields, field, perm);
                    onChange(p);
                    onFieldsChange(m);
                } else {
                    const [p, m] = addField(permissions, memberFields, field, perm);
                    onChange(p);
                    onFieldsChange(m);
                }
            },
            toggleAllFields: () => {
                if (memberFields === null) onFieldsChange({});
                else onFieldsChange(null);
            },
            memberFilter,
            setMemberFilter: onFilterChange,
            memberRestrictionsEnabled,
            setMemberRestrictionsEnabled: onMemberRestrictionsEnabledChange,
        };

        const unknownPerms = unknown.map(perm => (
            <PermsItem key={perm} item={{ type: 'perm', name: perm, id: perm }} ctx={ctx} />
        ));

        return (
            <div class="perms-editor" ref={node => this.#node = node}>
                <div>
                    <Checkbox checked={showRaw} onChange={showRaw => this.setState({ showRaw })} />
                    don’t mind this thing this is temporary for debugging
                </div>
                {spec.map((x, i) => <PermsItem item={x} key={i} ctx={ctx} />)}
                {unknownPerms}
            </div>
        );
    }
}

function PermsItem ({ item, ctx, disabled }) {
    disabled = disabled || !ctx.editable;
    if (item.requires) {
        for (const req of item.requires) {
            if (!ctx.states.get(req).active) {
                disabled = true;
                break;
            }
        }
    }
    if (item.type === 'category' || item.type === 'group') {
        const className = item.type === 'category' ? 'perms-category' : 'perms-group';
        return (
            <div class={className}>
                {item.name ? <div class="group-title">{item.name}</div> : null}
                {item.children.map((x, i) => <PermsItem key={i} item={x} ctx={ctx} disabled={disabled} />)}
            </div>
        );
    } else if (item.type === 'switch') {
        return (
            <div class="perms-item perms-switch">
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
                                    disabled={disabled}
                                    checked={state.active}
                                    onMouseOver={() => ctx.setShowImplied(opt.id)}
                                    onMouseOut={() => ctx.setShowImplied(null)}
                                    onClick={() => ctx.togglePerm(opt.id)} />
                                <span class="switch-option-label">
                                    {ctx.showRaw ? opt.id : opt.name}
                                </span>
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
            <div class="perms-item perms-perm">
                <Checkbox
                    class={className}
                    disabled={disabled}
                    checked={state.active}
                    onMouseOver={() => ctx.setShowImplied(state.impliedBy)}
                    onMouseOut={() => ctx.setShowImplied(null)}
                    onClick={() => ctx.togglePerm(item.id)} />
                {ctx.showRaw ? item.id : item.name}
            </div>
        );
    } else if (item.type === '!memberRestrictionsSwitch') {
        return (
            <div class="perms-item perms-perm">
                <Checkbox
                    class="perm-checkbox"
                    disabled={disabled}
                    checked={ctx.memberRestrictionsEnabled}
                    onClick={() => ctx.setMemberRestrictionsEnabled(!ctx.memberRestrictionsEnabled)} />
                {item.name}
            </div>
        );
    } else if (item === '!memberFieldsEditor') {
        if (!ctx.memberRestrictionsEnabled) return null;
        return (
            <MemberFieldsEditor
                disabled={disabled}
                fields={ctx.memberFields}
                toggleField={ctx.toggleField}
                toggleAll={ctx.toggleAllFields} />
        );
    } else if (item === '!memberFilterEditor') {
        if (!ctx.memberRestrictionsEnabled || !ctx.setMemberFilter) return null;
        const defaultValue = { filter: {} };
        return (
            <MemberFilterEditor
                disabled={disabled}
                filter={ctx.memberFilter || defaultValue}
                onFilterChange={ctx.setMemberFilter} />
        );
    }
    return 'unknown perms spec type ' + item.type;
}

function MemberFieldsEditor ({ disabled, fields, toggleField, toggleAll }) {
    const items = [];
    if (fields !== null) {
        for (const field in fieldsSpec) {
            const item = fieldsSpec[field];
            let canRead = true;
            let canWrite = true;
            for (const f of item.fields) {
                if (!fields[f] || !fields[f].includes('r')) canRead = false;
                if (!fields[f] || !fields[f].includes('w')) canWrite = false;
            }

            items.push(
                <tr class="member-field">
                    <td class="field-name">{item.name}</td>
                    <td class="field-perms">
                        <Checkbox
                            class={'perm-checkbox' + (canRead && canWrite ? ' is-implied-active' : '')}
                            disabled={disabled}
                            checked={canRead}
                            onClick={() => toggleField(field, 'r')} />
                        {memberFieldsRead}
                        {' \u00a0 \u00a0'}
                        <Checkbox
                            class="perm-checkbox"
                            disabled={disabled}
                            checked={canWrite}
                            onClick={() => toggleField(field, 'w')} />
                        {memberFieldsWrite}
                    </td>
                </tr>
            );
        }
    }

    return (
        <div class="member-fields-container">
            <table class="member-fields">
                <thead class="member-fields-all">
                    <tr>
                        <th>
                            <Checkbox
                                class="perm-checkbox"
                                disabled={disabled}
                                checked={fields === null}
                                onClick={toggleAll} />
                            {memberFieldsAll}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
            </table>
        </div>
    );
}

function MemberFilterEditor ({ disabled, filter, onFilterChange }) {
    return (
        <div class="member-filter-editor">
            <JSONFilterEditor
                disabled={disabled}
                value={filter}
                onChange={onFilterChange} />
        </div>
    );
}
