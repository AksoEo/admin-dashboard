import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import { routerContext } from '../../../router';
import { Dialog, TextField, Button, CircularProgress } from '@cpsdqs/yamdl';
import { UEACode } from '@tejo/akso-client';
import Form, { Validator } from '../../../components/form';
import Segmented from '../../../components/segmented';
import data from '../../../components/data';
import { coreContext } from '../../../core/connection';
import locale from '../../../locale';

// TODO: use core api properly

/// Add member dialog.
///
/// # Props
/// - open/onClose: open state
export default class AddMemberDialog extends PureComponent {
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
    'Org UEA codes must begin with xx': state => state.type === 'human'
        ? locale.members.addMember.invalidHumanCode
        : locale.members.addMember.invalidOrgCode,
    'newCode is taken': () => locale.members.addMember.newCodeTaken,
};

/// # Props
/// - onSuccess: callback
class AddMember extends PureComponent {
    static contextType = routerContext;

    state = {
        type: 'human',
        newCode: '',
        name: '',
        abbrev: '',
        lastLegal: '',
        first: '',
        last: '',
        loading: false,
        error: null,
    };

    codeValidator = null;

    render () {
        const nameField = this.state.type === 'human' ? 'firstLegal' : 'full';
        const extraNameFields = this.state.type === 'human'
            ? ['lastLegal', 'first', 'last']
            : ['abbrev'];

        const codeSuggestions = UEACode.suggestCodes({
            type: this.state.type,
            firstNames: [this.state.name, this.state.firstName],
            lastNames: [this.state.lastNameLegal, this.state.lastName],
            fullName: this.state.name,
        });

        return (
            <coreContext.Consumer>
                {core => (<Form onSubmit={() => {
                    this.setState({ loading: true, error: null });

                    let nameFields = [nameField].concat(extraNameFields);
                    const nameValue = Object.fromEntries(nameFields
                        .filter(id => this.state[id === nameField ? 'name' : id])
                        .map(id => [id, this.state[id === nameField ? 'name' : id]]));
                    const code = this.state.newCode;

                    core.createTask('codeholders/create', {}, {
                        type: this.state.type,
                        code: { new: code },
                        name: nameValue,
                    }).runOnceAndDrop().then(() => {
                        // find codeholder ID and open their page
                        core.createTask('codeholders/list', {}, {
                            jsonFilter: { filter: { newCode: code } },
                            offset: 0,
                            limit: 1,
                        }).runOnceAndDrop().then(res => {
                            this.context.navigate('/membroj/' + res.items[0]);
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
                        selected={this.state.type}
                        onSelect={type => this.setState({ type })}
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
                        outline
                        label={locale.members.addMember[nameField] + '*'}
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })}
                        disabled={this.state.loading}
                        validate={value => {
                            if (!value.trim()) throw { error: locale.members.addMember.noName };
                        }} />
                    {extraNameFields.map(id => (
                        <Validator
                            key={id}
                            component={TextField}
                            class="form-field text-field"
                            outline
                            label={locale.members.addMember[id]}
                            value={this.state[id]}
                            onChange={e => this.setState({ [id]: e.target.value })}
                            disabled={this.state.loading}
                            validate={() => {}} />
                    ))}
                    <Validator
                        component={data.ueaCode.editor}
                        class="form-field text-field"
                        ref={validator => this.codeValidator = validator}
                        outline
                        value={this.state.newCode}
                        suggestions={codeSuggestions}
                        onChange={newCode => this.setState({ newCode })}
                        disabled={this.state.loading}
                        id={-1} // pass nonsense id to check if it’s taken
                        validate={value => {
                            if (!UEACode.validate(value) || (new UEACode(value)).type !== 'new') {
                                throw { error: locale.members.addMember.invalidUEACode };
                            }
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
                </Form>)}
            </coreContext.Consumer>
        );
    }
}
