import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import PropTypes from 'prop-types';
import { appContext } from '../../router';
import { Dialog, TextField, Button, CircularProgress } from 'yamdl';
import Form, { Validator } from '../../components/form';
import Segmented from '../../components/segmented';
import UEACode from 'akso-client/uea-code';
import locale from '../../locale';
import client from '../../client';

/// Add member dialog.
export default class AddMemberDialog extends PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
    };

    render () {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.props.onClose}
                backdrop
                fullScreen={width => width < 400}
                class="members-add-member-dialog"
                title={locale.members.addMember.title}>
                <AddMember onSuccess={this.props.onClose} />
            </Dialog>
        );
    }
}

// the api returns errors as strings so i guess here’s a hacky way of localizing those
const KNOWN_ERRORS = {
    'Org UEA codes must begin with xx': state => state.codeholderType === 'human'
        ? locale.members.addMember.invalidHumanCode
        : locale.members.addMember.invalidOrgCode,
    'newCode is taken': () => locale.members.addMember.newCodeTaken,
};

class AddMember extends PureComponent {
    static propTypes = {
        onSuccess: PropTypes.func.isRequired,
    };

    static contextType = appContext;

    state = {
        codeholderType: 'human',
        newCode: '',
        name: '',
        loading: false,
        error: null,
    };

    codeValidator = null;

    render () {
        const nameField = this.state.codeholderType === 'human' ? 'firstNameLegal' : 'fullName';

        return (
            <Form onSubmit={() => {
                this.setState({ loading: true, error: null });

                client.post('/codeholders', {
                    codeholderType: this.state.codeholderType,
                    newCode: this.state.newCode,
                    [nameField]: this.state.name,
                }).then(() => {
                    // find codeholder ID and open their page
                    client.get('/codeholders', {
                        filter: { newCode: this.state.newCode },
                        fields: ['id'],
                        limit: 1,
                    }).then(res => {
                        if (res.body[0]) {
                            const id = res.body[0].id;
                            this.context.navigate('/membroj/' + id);
                        }
                    }).catch(() => {
                        // silently fail
                    }).then(() => {
                        this.setState({ loading: false });
                        this.props.onSuccess();
                    });
                }).catch(error => {
                    let errorIsKnown = false;
                    if (error) {
                        const errorString = error.toString();
                        for (const key in KNOWN_ERRORS) {
                            if (errorString.includes(key)) {
                                errorIsKnown = true;

                                this.codeValidator.shake();
                                this.codeValidator.setError({
                                    error: KNOWN_ERRORS[key](this.state),
                                });
                                break;
                            }
                        }
                    }
                    if (!errorIsKnown) {
                        console.error('Unknown error', error); // eslint-disable-line no-console
                        this.setState({ error });
                    }
                    this.setState({ loading: false });
                });
            }}>
                <Validator
                    component={Segmented}
                    class="form-field"
                    selected={this.state.codeholderType}
                    onSelect={codeholderType => this.setState({ codeholderType })}
                    disabled={this.state.loading}
                    validate={() => true}>
                    {[
                        {
                            id: 'human',
                            label: locale.members.search.codeholderTypes.human,
                        },
                        {
                            id: 'org',
                            label: locale.members.search.codeholderTypes.org,
                        },
                    ]}
                </Validator>
                <Validator
                    component={TextField}
                    class="form-field text-field"
                    ref={validator => this.codeValidator = validator}
                    outline
                    label={locale.members.addMember.newCode}
                    value={this.state.newCode}
                    onChange={e => this.setState({ newCode: e.target.value })}
                    placeholder={locale.members.addMember.newCodePlaceholder}
                    maxLength={6}
                    disabled={this.state.loading}
                    validate={value => {
                        if (!UEACode.validate(value) || (new UEACode(value)).type !== 'new') {
                            throw { error: locale.members.addMember.invalidUEACode };
                        }
                    }} />
                <Validator
                    component={TextField}
                    class="form-field text-field"
                    outline
                    label={locale.members.addMember[nameField]}
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value })}
                    disabled={this.state.loading}
                    validate={value => {
                        if (!value) throw { error: locale.members.addMember.noName };
                    }} />
                <footer class="form-footer">
                    <Button type="submit" class="raised" disabled={this.state.loading}>
                        {this.state.loading ? (
                            <CircularProgress
                                class="progress-overlay"
                                indeterminate
                                small />
                        ) : null}
                        <span>{locale.members.addMember.add}</span>
                    </Button>
                </footer>
                {this.state.error ? (
                    <div class="form-error">
                        {locale.members.addMember.genericError}
                    </div>
                ) : null}
            </Form>
        );
    }
}
