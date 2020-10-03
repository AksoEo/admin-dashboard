import { h, Component } from 'preact';
import { Button, Dialog, CircularProgress } from '@cpsdqs/yamdl';
import Form, { Validator } from './form';
import DisplayError from './error';
import './task-dialog.less';

/// A dialog that performs a failable action.
/// Shows a loading spinner and stuff
///
/// # Props
/// - open/onClose
/// - title
/// - actionLabel: label string for the action button
/// - run: run closure; must return a promise. success will not be handled
/// - running: if true, will consider the task to be running
/// - container: will be passed to Dialog
export default class TaskDialog extends Component {
    state = {
        loading: false,
        error: null,
    };

    // button ref; for shaking on error
    #buttonValidator;

    #run = () => {
        this.setState({ loading: true, error: null });
        this.props.run().catch(error => {
            this.setState({ error });
            console.error(error); // eslint-disable-line no-console
            this.#buttonValidator.shake();
        }).then(() => {
            this.setState({ loading: false });
        });
    };

    render ({
        title,
        open,
        onClose,
        actionLabel,
        mapError,
        running,
        container,
        ...extra
    }, { loading: loadingState, error }) {
        const className = 'task-dialog ' + (this.props.class || '');

        const loading = loadingState || running;

        return (
            <Dialog
                {...extra}
                class={className}
                backdrop
                open={open}
                title={title}
                onClose={onClose}
                container={container}>
                <Form class="task-dialog-form" onSubmit={this.#run}>
                    {this.props.children}
                    <footer class="task-dialog-footer">
                        <span class="task-dialog-footer-phantom" />
                        <Validator
                            component={Button}
                            raised
                            type="submit"
                            disabled={loading}
                            ref={view => this.#buttonValidator = view}
                            validate={() => {}}>
                            <CircularProgress
                                class="progress-overlay"
                                indeterminate={loading}
                                small />
                            <span>
                                {actionLabel}
                            </span>
                        </Validator>
                    </footer>
                    {error ? (
                        <div class="task-dialog-error">
                            <DisplayError error={error} />
                        </div>
                    ) : null}
                </Form>
            </Dialog>
        );
    }
}
