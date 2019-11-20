import { h } from 'preact';
import { useRef, useState } from 'preact/compat';
import { Dialog, TextField, Button, CircularProgress } from '@cpsdqs/yamdl';
import Form, { Validator } from '../../../components/form';
import { codeholders as locale, detail as detailLocale } from '../../../locale';
import './style';

export default {
    update ({ open, core, task }) {
        const buttonValidator = useRef(null);
        const [error, setError] = useState(null);

        const changedFields = task.options._changedFields || [];

        return (
            <Dialog
                backdrop
                title={detailLocale.saveTitle}
                class="codeholders-task-update"
                open={open}
                onClose={() => task.drop()}>
                <Form class="task-update-form" onSubmit={() => {
                    setError(null);
                    task.runOnce().catch(err => {
                        setError(err);
                        buttonValidator.current.shake();
                    });
                }}>
                    <div class="commit-info">
                        <span class="changed-fields-title">
                            {detailLocale.diff}
                        </span>
                        <ul class="changed-fields">
                            {changedFields.map(field => (
                                <li key={field}>
                                    {locale.fields[field]}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <TextField
                        class="update-comment"
                        label={detailLocale.updateComment}
                        value={task.parameters.updateComment || ''}
                        onChange={e => task.update({ updateComment: e.target.value })} />
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
                                {detailLocale.commit}
                            </span>
                        </Validator>
                    </footer>
                </Form>
            </Dialog>
        );
    }
};
