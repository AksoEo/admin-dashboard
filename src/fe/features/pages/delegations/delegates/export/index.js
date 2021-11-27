import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, CircularProgress } from 'yamdl';
import DialogSheet from '../../../../../components/dialog-sheet';
import DynamicHeightDiv from '../../../../../components/dynamic-height-div';
import { coreContext } from '../../../../../core/connection';
import { delegations as locale } from '../../../../../locale';
import { load } from './data';
import './index.less';

export default class DelegatesExportDialog extends PureComponent {
    render ({ open, onClose }) {
        return (
            <DialogSheet
                class="delegates-export-dialog"
                backdrop
                title={locale.export.title}
                open={open}
                onClose={onClose}>
                <DelegatesExport />
            </DialogSheet>
        );
    }
}

class DelegatesExport extends PureComponent {
    state = {
        loading: false,
        progress: {},
        error: null,
        data: null,
        org: 'uea',
    };

    static contextType = coreContext;

    load () {
        this.setState({ loading: true, progress: {} });
        this._pendingProgress = {};
        load((status, current, target) => {
            const progress = { ...(this._pendingProgress || this.state.progress) };
            progress[status] = [current, target];
            progress._current = status;
            this._pendingProgress = progress; // setState may be too slow sometimes
            this.setState({ progress });
        }, this.context, this.state.org).then(data => {
            const progress = { ...(this._pendingProgress || this.state.progress) };
            progress._current = null;
            this.setState({ loading: false, data, progress });
            console.log(data);
        }).catch(error => {
            this.setState({ loading: false, error });
            console.log(error);
        });
    }

    render () {
        let contents;
        if (this.state.loading) {
            contents = (
                <div class="export-loading">
                    <ProgressDisplay progress={this.state.progress} />
                </div>
            );
        } else if (this.state.error) {
            contents = 'todo error';
        } else if (this.state.data) {
            contents = (
                <div class="export-result">
                    <ProgressDisplay progress={this.state.progress} />
                </div>
            );
        } else {
            contents = (
                <div class="export-start-container">
                    <Button raised onClick={() => this.load()}>
                        {locale.export.start}
                    </Button>
                </div>
            );
        }

        return (
            <div class="delegates-export-contents">
                {contents}
            </div>
        );
    }
}

function ProgressDisplay ({ progress }) {
    return (
        <DynamicHeightDiv class="progress-display" useFirstHeight>
            {Object.keys(progress).filter(key => !key.startsWith('_')).map(key => (
                <div class="progress-item" key={key}>
                    <CircularProgress
                        small
                        indeterminate={progress._current === key}
                        progress={(progress[key][0] + progress[key][1] === 0)
                            ? 1 // show 1 for 0/0
                            : progress[key][0] / Math.max(1e-9, progress[key][1])} />
                    <span class="item-label">
                        {locale.export.progress.messages[key]}
                    </span>
                    <span class="item-value">
                        <span class="item-completed">{progress[key][0]}</span>
                        /
                        <span class="item-total">{progress[key][1]}</span>
                    </span>
                </div>
            ))}
        </DynamicHeightDiv>
    );
}
