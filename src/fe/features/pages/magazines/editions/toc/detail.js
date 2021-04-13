import { h } from 'preact';
import EditIcon from '@material-ui/icons/Edit';
import Page from '../../../../../components/page';
import DetailView from '../../../../../components/detail';
import Meta from '../../../../meta';
import { AudioIcon } from '../../../../../components/icons';
import { connectPerms } from '../../../../../perms';
import { coreContext } from '../../../../../core/connection';
import { magazineToc as locale } from '../../../../../locale';
import { Files } from '../files';
import { FIELDS } from './fields';
import './detail.less';

export default connectPerms(class MagazineTocEntry extends Page {
    state = {
        edit: null,
    };

    static contextType = coreContext;

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

        this.#commitTask = this.context.createTask('magazines/updateTocEntry', {
            magazine: this.magazine,
            edition: this.edition,
            id: this.id,
            _changedFields: changedFields,
        }, this.state.edit);
        this.#commitTask.on('success', this.onEndEdit);
        this.#commitTask.on('drop', () => this.#commitTask = null);
    };

    componentWillUnmount () {
        if (this.#commitTask) this.#commitTask.drop();
    }

    get magazine () {
        return +this.props.matches.magazine[1];
    }

    get edition () {
        return +this.props.matches.edition[1];
    }

    get id () {
        return +this.props.match[1];
    }

    render ({ perms, editing }, { edit }) {
        const { magazine, edition, id } = this;

        const actions = [];

        if (perms.hasPerm('')) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: () => this.props.push('redakti', true),
            });
        }

        if (perms.hasPerm('')) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('magazines/deleteTocEntry', {
                    magazine,
                    edition,
                    id,
                }),
                overflow: true,
            });
        }

        return (
            <div class="magazine-toc-entry-page">
                <Meta
                    title={locale.detailTitle}
                    actions={actions} />

                <DetailView
                    view="magazines/tocEntry"
                    options={{ magazine, edition }}
                    id={id}
                    fields={FIELDS}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={() => this.props.pop()} />

                {!editing && (
                    <Files
                        formats={{
                            mp3: 'audio/mpeg',
                            wav: 'audio/wave',
                            flac: 'audio/flac',
                        }}
                        icon={<AudioIcon />}
                        view={['magazines/tocRecitations', { magazine, edition, id }]}
                        onUpload={(core, format, file) => {
                            core.createTask('magazines/updateTocRecitation', { magazine, edition, id }, { format, file });
                        }}
                        onDelete={(core, format) => {
                            core.createTask('magazines/deleteTocRecitation', { magazine, edition, id }, { format });
                        }}
                        downloadURL={f => `/magazines/${magazine}/editions/${edition}/toc/${id}/recitation/${f}`} />
                )}
            </div>
        );
    }
});

