import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
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
}))(function Footer ({ countries, item }) {
    if (!countries) return null;

    const countryItems = [];

    for (const code in countries) {
        const name = countries[code].name_eo;

        countryItems.push({
            key: code,
            column: item.countries.includes(code),
            node: <CountryItem code={code} name={name} />,
        });
    }

    return (
        <MulticolList columns={2} itemHeight={48}>
            {countryItems}
        </MulticolList>
    );
});

function CountryItem ({ code, name }) {
    return (
        <div class="country-item">
            <CountryFlag code={code} /> {name}
        </div>
    );
}
