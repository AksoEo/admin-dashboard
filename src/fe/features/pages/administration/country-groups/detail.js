import { h } from 'preact';
import { useState } from 'preact/compat';
import { Button, CircularProgress } from '@cpsdqs/yamdl';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import Page from '../../../../components/page';
import { CountryFlag } from '../../../../components/data/country';
import MulticolList from '../../../../components/multicol-list';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import { connect, coreContext } from '../../../../core/connection';
import { FIELDS } from './fields';
import { countryGroups as locale, detail as detailLocale } from '../../../../locale';
import './style';

export default class CountryGroupPage extends Page {
    static contextType = coreContext;

    state = {
        edit: null,
    };

    onEndEdit = () => {
        this.props.editing && this.props.editing.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return;
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return;
        }

        this.#commitTask = this.context.createTask('countries/updateGroup', {
            id: this.props.match[1],
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    render ({ match, editing }, { edit }) {
        const id = match[1];

        const actions = [];

        actions.push({
            label: detailLocale.edit,
            icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
            action: () => this.props.onNavigate(`/administrado/landgrupoj/${id}/redakti`, true),
        });

        actions.push({
            label: detailLocale.delete,
            action: () => this.context.createTask('countries/deleteGroup', {}, { id }),
            overflow: true,
        });

        return (
            <div class="country-group-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="countries/group"
                    id={id}
                    fields={FIELDS}
                    footer={Footer}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit} />
            </div>
        );
    }
}

const Footer = connect('countries/countries')(countries => ({
    countries,
}))(function Footer ({ countries, item, editing }) {
    if (!countries) return null;

    const [tentativeMemberships, setTentativeMemberships] = useState({});

    const countryItems = [];

    for (const code in countries) {
        const isMember = item.countries.includes(code);
        if (!editing && !isMember) continue;

        const name = countries[code].name_eo;

        const setTentativeMembership = membership => {
            const tm = { ...tentativeMemberships };
            if (membership === true || membership === false) {
                tm[code] = membership;
            } else {
                delete tm[code];
            }
            setTentativeMemberships(tm);
        };

        const tentativeMembership = tentativeMemberships[code] || null;
        const hasTM = tentativeMembership !== null;

        const isGUIMember = hasTM ? tentativeMembership : isMember;

        countryItems.push({
            key: code,
            column: isGUIMember ? 0 : 1,
            node: <CountryItem
                group={item.code}
                code={code}
                name={name}
                isMember={isMember}
                editing={editing}
                setTentativeMembership={setTentativeMembership} />,
        });
    }

    return (
        <MulticolList columns={editing ? 2 : 1} itemHeight={48}>
            {countryItems}
        </MulticolList>
    );
});

function CountryItem ({ group, code, name, editing, isMember, setTentativeMembership }) {
    const [currentTask, setCurrentTask] = useState(null);

    return (
        <coreContext.Consumer>
            {core => {
                const onClick = () => {
                    if (!editing || currentTask) return;
                    let task;
                    if (!isMember) {
                        task = core.createTask('countries/addGroupCountry', {
                            group,
                        }, {
                            country: code,
                        });
                        setTentativeMembership(true);
                    } else {
                        task = core.createTask('countries/removeGroupCountry', {
                            group,
                        }, {
                            country: code,
                        });
                        setTentativeMembership(false);
                    }
                    setCurrentTask(task);
                    task.runOnceAndDrop().catch(err => {
                        console.error(err); // eslint-disable-line no-console
                    }).then(() => {
                        setTentativeMembership(null);
                        setCurrentTask(null);
                    });
                };

                return (
                    <Button
                        class="country-item"
                        disabled={!!currentTask}
                        onClick={onClick}>
                        <CountryFlag code={code} /> {name}
                        {currentTask
                            ? <CircularProgress indeterminate />
                            : isMember ? <CheckIcon style={{ verticalAlign: 'middle' }} /> : null}
                    </Button>
                );
            }}
        </coreContext.Consumer>
    );
}
