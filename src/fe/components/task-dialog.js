import { h, Component } from 'preact';
import { Button, Dialog, CircularProgress } from '@cpsdqs/yamdl';
import Form, { Validator } from './form';
import './task-dialog.less';

/// A dialog that performs a failable action.
/// Shows a loading spinner and stuff
///
/// # Props
/// - open/onClose
/// - title
/// - actionLabel: label string for the action button
/// - mapError: function to map an error to a (human-readable?) string (optional)
/// - run: run closure; must return a promise. success will not be handled
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
        });
    };

    render ({ title, open, onClose, actionLabel, mapError }, { loading, error }) {
        const className = 'task-dialog ' + (this.props.class || '');

        return (
            <Dialog
                class={className}
                backdrop
                open={open}
                title={title}
                onClose={onClose}>
                <Form class="task-dialog-form" onSubmit={this.#run}>
                    {this.props.children}
                    <footer class="task-dialog-footer">
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
                            {mapError ? mapError(error) : ('' + error)}
                        </div>
                    ) : null}
                </Form>
            </Dialog>
        );
    }
}
