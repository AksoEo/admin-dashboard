import { h } from 'preact';
import { Fragment } from 'preact/compat';
import EditIcon from '@material-ui/icons/Edit';
import DetailPage from '../../../../../components/detail/detail-page';
import DetailView from '../../../../../components/detail/detail';
import DetailShell from '../../../../../components/detail/detail-shell';
import { FIELDS, Footer } from './fields';
import { magazineSnaps as locale } from '../../../../../locale';

export default class Snapshot extends DetailPage {
    state = {
        org: null,
    };

    locale = locale;

    get magazine () {
        return +this.props.matches.magazine[1];
    }

    get edition () {
        return +this.props.matches.edition[1];
    }

    get id () {
        return this.props.match[1];
    }

    createCommitTask (changedFields, edit) {
        return this.context.createTask('magazines/updateSnapshot', {
            magazine: this.magazine,
            edition: this.edition,
            id: this.id,
            _changedFields: changedFields,
        }, edit);
    }

    renderActions ({ perms }) {
        const actions = [];

        if (perms.hasPerm(`magazines.snapshots.update.${this.state.org}`)) {
            actions.push({
                icon: <EditIcon style={{ verticalAlign: 'middle' }} />,
                label: locale.update.menuItem,
                action: this.onBeginEdit,
            });
        }

        if (perms.hasPerm(`magazines.snapshots.delete.${this.state.org}`)) {
            actions.push({
                label: locale.delete.menuItem,
                action: () => this.context.createTask('magazines/deleteSnapshot', {
                    magazine: this.magazine,
                    edition: this.edition,
                    id: this.id,
                }),
                overflow: true,
            });
        }

        return actions;
    }

    renderContents ({ editing }, { edit }) {
        return (
            <Fragment>
                <DetailView
                    view="magazines/snapshot"
                    options={{ magazine: this.magazine, edition: this.edition, id: this.id }}
                    id={this.id}
                    fields={FIELDS}
                    footer={Footer}
                    userData={{ magazine: this.magazine, edition: this.edition, id: this.id }}
                    locale={locale}
                    edit={edit}
                    onEditChange={edit => this.setState({ edit })}
                    editing={editing}
                    onEndEdit={this.onEndEdit}
                    onCommit={this.onCommit}
                    onDelete={this.onDelete} />

                <DetailShell
                    view="magazines/magazine"
                    id={this.magazine}
                    fields={{}} locale={{}}
                    onData={data => data && this.setState({ org: data.org })} />
            </Fragment>
        );
    }
}
