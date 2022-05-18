//! Task views for queries.
import { h } from 'preact';
import { useRef, useState } from 'preact/compat';
import { Dialog, TextField, CircularProgress, Button } from 'yamdl';
import { Form, Field } from '../components/form';
import { search as locale } from '../locale';
import './queries.less';

function makeQuerySaveDialog (type) {
    void type; // TODO
    return ({ task, open }) => {
        const buttonContainer = useRef(null);
        const [error, setError] = useState(null);

        return (
            <Dialog
                backdrop
                class="queries-task-update"
                open={open}
                title={locale.saveFilterTitle}
                onClose={() => task.drop()}>
                <Form class="task-form" onSubmit={() => {
                    setError(null);
                    task.runOnce().catch(err => {
                        setError(err);
                        buttonContainer.current.shake();
                    });
                }}>
                    <TextField
                        required
                        class="form-field text-field"
                        label={locale.savedFilterName}
                        value={task.parameters.name}
                        onChange={e => task.update({ name: e.target.value })} />
                    <TextField
                        component={TextField}
                        class="form-field text-field"
                        label={locale.savedFilterDesc}
                        value={task.parameters.description}
                        onChange={e => task.update({ description: e.target.value })} />
                    {error ? (
                        <div class="error-message">
                            {'' + error}
                        </div>
                    ) : null}
                    <Field class="form-footer" ref={buttonContainer}>
                        <span class="footer-spacer" />
                        <Button
                            raised
                            type="submit"
                            disabled={task.running}>
                            <CircularProgress
                                class="progress-overlay"
                                indeterminate={task.running}
                                small />
                            <span>
                                {locale.saveFilter}
                            </span>
                        </Button>
                    </Field>
                </Form>
            </Dialog>
        );
    };
}

export default {
    add: makeQuerySaveDialog('add'),
    update: makeQuerySaveDialog('update'),
};
