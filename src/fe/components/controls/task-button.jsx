import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { Button, CircularProgress } from 'yamdl';
import './task-button.less';

/**
 * A task button is a button that can show an loading animation.
 *
 * # Props
 * - run: () => Promise<void>
 * - innerRef: inner button ref
 * - children: button label
 * - any other prop will be forwarded to Button
 */
export default class TaskButton extends PureComponent {
    state = {
        loading: false,
    };

    onClick = () => {
        if (this.state.loading) return;
        this.setState({ loading: true });
        this.props.run().catch(err => {
            console.error(err); // eslint-disable-line no-console
            // TODO: do something with this error
        }).then(() => {
            this.setState({ loading: false });
        });
    };

    render ({ run, innerRef, children, ...props }, { loading }) {
        void run;
        props.class = (props.class || '') + ' task-button';
        if (loading) props.class += ' is-loading';

        return (
            <Button
                ref={innerRef}
                onClick={this.onClick}
                {...props}>
                <CircularProgress small class="task-button-loading" indeterminate={loading} />
                <label class="task-button-label">
                    {children}
                </label>
            </Button>
        );
    }
}
