import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../components/page';
import DetailView from '../../../components/detail';
import Meta from '../../meta';
import { codeholders as locale } from '../../../locale';
import { connectPerms } from '../../../perms';
import { coreContext } from '../../../core/connection';

const detailFields = {
    name: {
        component ({ value, editing, onChange }) {
            return value;
        },
    },
    mime: {
        component ({ value, editing, onChange }) {
            return value;
        },
    },
    size: {
        component ({ value, editing, onChange }) {
            return value;
        },
    },
    addedBy: {
        component ({ value, editing, onChange }) {
            return value;
        },
    },
    time: {
        component ({ value, editing, onChange }) {
            return value;
        },
    },
    description: {
        component ({ value, editing, onChange }) {
            return value;
        },
    },
};

export default connectPerms(class FileDetailPage extends Page {
    static contextType = coreContext;

    getCodeholderId = () => +this.props.matches[this.props.matches.length - 3][1];
    getId = () => +this.props.match[1];

    render ({ perms }) {
        const id = this.getId();
        const codeholderId = this.getCodeholderId();
        const actions = [];

        if (perms.hasCodeholderField('files', 'w')) {
            actions.push({
                label: locale.delete,
                action: () => this.context.createTask('codeholders/deleteFile', {
                    id: this.getCodeholderId(),
                    file: this.getId(),
                }),
                overflow: true,
            });
        }

        return (
            <div class="file-detail-page">
                <Meta
                    title={locale.fileTitle}
                    actions={actions} />
                <DetailView
                    view="codeholders/codeholderFile"
                    id={id}
                    options={{ codeholderId }}
                    fields={detailFields}
                    locale={locale.files}
                    onDelete={() => this.props.pop()} />
            </div>
        );
    }
});
