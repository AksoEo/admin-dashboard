import { h } from 'preact';
import Page from '../page';
import Meta from '../../features/meta';
import permsContext from '../../perms';
import { coreContext } from '../../core/connection';

export default class DetailPage extends Page {
    static contextType = coreContext;

    constructor (...args) {
        super(...args);

        this.state = { ...this.state, edit: null };
    }

    onBeginEdit = () => {
        this.props.push('redakti', true);
    };

    onEndEdit = () => {
        this.props.editing?.pop(true);
        this.setState({ edit: null });
    };

    #commitTask = null;
    onCommit = changedFields => {
        if (!this.props.editing || this.#commitTask) return Promise.resolve();
        if (!changedFields.length) {
            // nothing changed, so we can just pop the editing state
            this.props.editing.pop(true);
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.#commitTask = this.createCommitTask(changedFields, this.state.edit);
            this.#commitTask.on('success', this.onEndEdit);
            this.#commitTask.on('drop', () => {
                this.#commitTask = null;
                resolve();
            });
        });
    };

    onDelete = () => {
        this.props.pop();
    };

    componentWillUnmount () {
        this.#commitTask?.drop();
    }

    renderActions () {
        return [];
    }

    render ({ editing }) {
        const locale = this.locale;

        return (
            <permsContext.Consumer>
                {perms => {
                    const actions = this.renderActions({ perms }, this.state);

                    return (
                        <div class={'detail-page ' + (this.className || '')}>
                            <Meta
                                title={locale.detailTitle}
                                actions={actions}/>

                            {this.renderContents({ perms, editing }, this.state)}
                        </div>
                    );
                }}
            </permsContext.Consumer>
        );
    }
}
