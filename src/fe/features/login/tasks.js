import { h } from 'preact';
import { useRef } from 'preact/compat';
import { Dialog, TextField, CircularProgress, Button } from 'yamdl';
import { UEACode } from '@tejo/akso-client';
import Form, { Validator } from '../../components/form';
import { login as locale } from '../../locale';
import './style';

export default {
    initCreatePassword: ({ open, core, task }) => {
        const buttonValidator = useRef(null);

        const { create } = task.options;
        const { login } = task.parameters;

        const description = create
            ? locale.createPasswordDescription(login)
            : locale.resetPasswordDescription;

        return (
            <Dialog
                backdrop
                class="login-task-init-create-password"
                open={open}
                onClose={() => task.drop()}>
                <Form class="init-create-password-form" onSubmit={() => {
                    task.runOnce().then(() => {
                        core.createTask('info', {
                            message: create
                                ? locale.createPasswordSent
                                : locale.resetPasswordSent,
                        });
                    }).catch(() => {
                        buttonValidator.current.shake();
                    });
                }}>
                    <p>
                        {description}
                    </p>
                    <Validator
                        component={TextField}
                        class="form-field"
                        outline
                        label={locale.login}
                        type={login.includes('@') ? 'email' : 'text'}
                        autocapitalize="none"
                        spellcheck="false"
                        value={login}
                        onChange={e => task.update({ login: e.target.value })}
                        validate={value => {
                            if (!value.includes('@') && !UEACode.validate(value)) {
                                throw { error: locale.invalidUEACode };
                            }
                        }} />
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
                                {create
                                    ? locale.sendPasswordSetup
                                    : locale.sendPasswordReset}
                            </span>
                        </Validator>
                    </footer>
                </Form>
            </Dialog>
        );
    },
    logOut ({ open, task }) {
        return (
            <Dialog
                backdrop
                class="login-task-logout"
                open={open}
                onClose={() => task.drop()}>
                <CircularProgress indeterminate />
            </Dialog>
        );
    },
};
