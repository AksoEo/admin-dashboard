//! Task views for queries.
import { h } from 'preact';
import { useRef, useState } from 'preact/compat';
import { Dialog, TextField, CircularProgress, Button } from '@cpsdqs/yamdl';
import Form, { Validator } from '../components/form';
import { search as locale } from '../locale';
import './queries.less';

function makeQuerySaveDialog (type) {
    void type; // TODO
    return ({ task, open }) => {
        const buttonValidator = useRef(null);
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
                        buttonValidator.current.shake();
                    });
                }}>
                    <Validator
                        component={TextField}
                        class="form-field text-field"
                        label={locale.savedFilterName}
                        value={task.parameters.name}
                        onChange={e => task.update({ name: e.target.value })}
                        validate={value => {
                            if (!value) throw { error: locale.nameRequired };
                        }} />
                    <Validator
                        component={TextField}
                        class="form-field text-field"
                        label={locale.savedFilterDesc}
                        value={task.parameters.description}
                        onChange={e => task.update({ description: e.target.value })}
                        validate={() => {}} />
                    {error ? (
                        <div class="error-message">
                            {'' + error}
                        </div>
                    ) : null}
                    <footer class="form-footer">
                        <span class="footer-spacer" />
                        <Validator
                            component={Button}
                            raised
                            type="submit"
                            disabled={task.running}
                            ref={buttonValidator}
                            validate={() => {}}>
                            <CircularProgress
                                class="progress-overlay"
                                indeterminate={task.running}
                                small />
                            <span>
                                {locale.saveFilter}
                            </span>
                        </Validator>
                    </footer>
                </Form>
            </Dialog>
        );
    };
}

export default {
    add: makeQuerySaveDialog('add'),
    update: makeQuerySaveDialog('update'),
};
