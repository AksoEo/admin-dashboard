import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../components/page';
import DetailView from '../../../components/detail';
import Meta from '../../meta';
import { codeholders as locale, detail as detailLocale } from '../../../locale';
import { routerContext } from '../../../router';
import { Header, fields, Footer } from './detail-fields';

export default class Detail extends Page {
    static contextType = routerContext;

    onEndEdit = () => this.props.editing && this.props.editing.pop(true);

    render ({ editing }) {
        const { match } = this.props;
        const id = match[1];

        const actions = [];
        if (!editing) {
            actions.push({
                label: detailLocale.edit,
                icon: <EditIcon />,
                action: () => this.context.navigate(`/membroj/${id}/redakti`, true),
            });
        }

        return (
            <div class="codeholder-detail-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />
                <DetailView
                    view="codeholders/codeholder"
                    id={id}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    options={{
                        fields: [
                            'id',
                            'type',
                            'name',
                            'careOf',
                            'website',
                            'code',
                            'creationTime',
                            'hasPassword',
                            'address',
                            'feeCountry',
                            'membership',
                            'email',
                            'enabled',
                            'notes',
                            'officePhone',
                            'landlinePhone',
                            'cellphone',
                            'isDead',
                            'birthdate',
                            'age',
                            'deathdate',
                            'profilePictureHash',
                            'isActiveMember',
                            'profession',
                        ],
                    }}
                    header={Header}
                    fields={fields} />
            </div>
        );
    }
}
