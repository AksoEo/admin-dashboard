import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import FormContext from './context';

/// A `<form>` with validation handling.
///
/// # Props
/// - onSubmit: submission handler
///
/// # Examples
/// ```jsx
/// render() {
///     return (
///         <Form onSubmit={() => alert('form submitted')}>
///             <ValidatedTextField
///                 validate={() => {
///                     if (this.state.value !== 'valid') return 'error label';
///                 }}
///                 value={this.state.value}
///                 onChange={e => this.setState({ value: e.target.value })} />
///         </Form>
///     );
/// }
/// ```
export default class Form extends PureComponent {
    static contextType = FormContext;

    /// Form fields registered using [FormContext].
    fields = new Set();

    /// Validates all form fields.
    /// @return {boolean} true if successful.
    validate () {
        let valid = true;
        for (const field of this.fields) {
            if (!field.validate(true)) {
                valid = false;
            }
        }
        return valid;
    }

    componentDidMount () {
        // register the form inside a parent form context if applicable
        if (this.context) this.context.register(this);
    }
    componentWillUnmount () {
        if (this.context) this.context.deregister(this);
    }

    /// FormContext register handler
    onRegister = field => {
        this.fields.add(field);
    };

    /// FormContext deregister handler
    onDeregister = field => {
        this.fields.delete(field);
    };

    /// Native `submit` event handler
    onSubmit = e => {
        e.preventDefault();
        this.submit();
    };

    submit () {
        if (this.validate()) {
            this.props.onSubmit();
        }
    }

    render () {
        return (
            <FormContext.Provider value={{
                register: this.onRegister,
                deregister: this.onDeregister,
            }}>
                <form
                    {...this.props}
                    onSubmit={this.onSubmit}>
                    {this.props.children}
                </form>
            </FormContext.Provider>
        );
    }
}
