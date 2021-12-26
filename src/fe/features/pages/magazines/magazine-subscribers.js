import { h } from 'preact';
import { Fragment } from 'preact/compat';
import { Checkbox } from 'yamdl';
import { magazines as locale } from '../../../locale';
import JSONFilterEditor from '../../../components/overview/json-filter-editor';
import Segmented from '../../../components/controls/segmented';
import './magazine-subscribers.less';

function MagazinePerms ({ value, editing, onChange }) {
    if (!editing) {
        if (value === true) return locale.subscribers.everyone;
        else if (value === false) return locale.subscribers.noone;
    }

    const selected = value === true ? 'true' : value === false ? 'false' : 'complex';
    const topSwitch = (
        <Segmented selected={selected} onSelect={value => {
            if (value === selected) return;
            if (value === 'complex') {
                onChange({
                    members: true,
                    membersIncludeLastYear: null,
                    filter: null,
                    freelyAvailableAfter: null,
                });
            } else onChange(value === 'true');
        }}>
            {[
                { id: 'true', label: locale.subscribers.everyone },
                { id: 'false', label: locale.subscribers.noone },
                { id: 'complex', label: locale.subscribers.complex },
            ]}
        </Segmented>
    );

    if (editing && selected !== 'complex') {
        return (
            <div class="magazine-subscriber-perms">
                <div class="perms-top-switch">
                    {topSwitch}
                </div>
            </div>
        );
    }

    return (
        <div class="magazine-subscriber-perms">
            {editing ? (
                <div class="perms-top-switch">
                    {topSwitch}
                </div>
            ) : null}
            <div class="perms-field">
                <div class="field-label">
                    {locale.subscribers.members}
                </div>
                <div class="field-desc">
                    {locale.subscribers.membersDesc}
                </div>
                <MagazinePermsMembers
                    value={value.members}
                    editing={editing}
                    onChange={members => onChange({ ...value, members })} />
            </div>
            {(editing || value.membersIncludeLastYear) ? (
                <div class="perms-field">
                    <div class="field-label">
                        {locale.subscribers.membersIncludeLastYear}
                    </div>
                    <div class="field-desc">
                        {locale.subscribers.membersIncludeLastYearDesc}
                    </div>
                    <MagazinePermsIncludeLastYear
                        value={value.membersIncludeLastYear}
                        editing={editing}
                        onChange={v => onChange({
                            ...value,
                            membersIncludeLastYear: v,
                        })} />
                </div>
            ) : null}
            {(editing || value.filter) ? (
                <div class="perms-field">
                    <div class="field-label">
                        {locale.subscribers.filter}
                    </div>
                    <div class="field-desc">
                        {locale.subscribers.filterDesc}
                    </div>
                    <MagazinePermsFilter
                        value={value.filter}
                        editing={editing}
                        onChange={filter => onChange({ ...value, filter })} />
                </div>
            ) : null}
            {(editing || value.freelyAvailableAfter) ? (
                <div class="perms-field">
                    <div class="field-label">
                        {locale.subscribers.freelyAvailableAfter}
                    </div>
                    <div class="field-desc">
                        {locale.subscribers.freelyAvailableAfterDesc}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function MagazinePermsMembers ({ value, editing, onChange }) {
    if (!editing) {
        if (value === true) return locale.subscribers.membersAll;
        if (value === false) return locale.subscribers.membersNone;
        return <MagazinePermsFilterControl valeu={value} />;
    }

    const selected = value === true ? 'true' : value === false ? 'false' : 'filter';
    return (
        <div class="magazine-perms-members">
            <Segmented selected={selected} onSelect={value => {
                if (value === selected) return;
                if (value === 'filter') onChange({});
                else onChange(value === 'true');
            }}>
                {[
                    { id: 'true', label: locale.subscribers.membersAll },
                    { id: 'false', label: locale.subscribers.membersNone },
                    { id: 'filter', label: locale.subscribers.membersFilter },
                ]}
            </Segmented>
            {(selected === 'filter') ? (
                <MagazinePermsFilterControl
                    value={value}
                    editing={editing}
                    onChange={onChange} />
            ) : null}
        </div>
    );
}

function MagazinePermsIncludeLastYear ({ value, editing, onChange }) {
    return 'emwo meow';
}

function MagazinePermsFilter ({ value, editing, onChange }) {
    const chkId = Math.random().toString(36);
    return (
        <div class="filter-field">
            {editing ? (
                <Fragment>
                    <Checkbox
                        id={chkId}
                        checked={value !== null}
                        disabled={!editing}
                        onChange={enabled => {
                            if (enabled === (value !== null)) return;
                            onChange(enabled ? {} : null);
                        }} />
                    {' '}
                    <label for={chkId}>
                        {locale.subscribers.enableFilter}
                    </label>
                </Fragment>
            ) : null}
            {value !== null ? (
                <MagazinePermsFilterControl
                    value={value}
                    editing={editing}
                    onChange={onChange} />
            ) : null}
        </div>
    );
}

function MagazinePermsFilterControl ({ value, editing, onChange }) {
    // FIXME: maaaaybe don't use the filter editor, since that has extra templating stuff
    return (
        <div class="filter-control">
            {editing ? (
                <div class="filter-control-desc">
                    {locale.subscribers.filterFieldDesc}
                </div>
            ) : null}
            <JSONFilterEditor
                class="perms-filter"
                expanded={editing}
                value={{ filter: value }}
                disabled={!editing}
                onChange={value => {
                    if (!editing) return;
                    onChange(value?.filter || null);
                }} />
        </div>
    );
}

export default function MagazineSubscribers ({ value, editing, onChange }) {
    return (
        <div class="magazine-subscribers">
            <div class="subscriber-type">
                <div class="type-label">{locale.subscribers.access}</div>
                <MagazinePerms
                    value={value.access}
                    editing={editing}
                    onChange={access => onChange({
                        ...value,
                        access,
                    })} />
            </div>
            <div class="subscriber-type">
                <div class="type-label">{locale.subscribers.paper}</div>
                <MagazinePerms
                    value={value.paper}
                    editing={editing}
                    onChange={paper => onChange({
                        ...value,
                        paper,
                    })} />
            </div>
        </div>
    );
}
