import { h, Component } from 'preact';
import { createContext } from 'preact-context';
import PropTypes from 'prop-types';
import { Spring } from '../../animation';
import './style';

/** Context that contains an interface to the Form component. */
export const FormContext = createContext({
    register: () => {},
    deregister: () => {}
});

/**
 * A `<form>` with validation handling.
 *
 * # Examples
 * ```jsx
 * render() {
 *     return (
 *         <Form onSubmit={() => alert('form submitted')}>
 *             <Validator
 *                 component="input"
 *                 validate={value => {
 *                     // thrown props will be added to the enclosed component’s props
 *                     if (value !== 'valid') throw { class: 'error' };
 *                 }}
 *                 value={this.state.value}
 *                 onInput={e => this.setState({ value: e.target.value })} />
 *         </Form>
 *     );
 * }
 * ```
 */
export default class Form extends Component {
    static propTypes = {
        /** Called when the native `submit` event is intercepted. */
        onSubmit: PropTypes.func.isRequired,
        children: PropTypes.arrayOf(PropTypes.element)
    };

    /** Form fields registered using [FormContext]. */
    fields = new Set();

    /**
     * Validates all form fields.
     * @return {boolean} true if successful.
     */
    validate () {
        let valid = true;
        for (const field of this.fields) {
            if (!field.validate(true)) {
                valid = false;
            }
        }
        return valid;
    }

    /** FormContext register handler */
    onRegister = field => {
        this.fields.add(field);
    };

    /** FormContext deregister handler */
    onDeregister = field => {
        this.fields.delete(field);
    };

    /** Native `submit` event handler */
    onSubmit = e => {
        e.preventDefault();
        if (this.validate()) {
            this.props.onSubmit();
        }
    };

    render () {
        return (
            <FormContext.Provider value={{
                register: this.onRegister,
                deregister: this.onDeregister
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

/**
 * Validation wrapper around any component that uses `value`.
 * Must be used inside a Form component.
 *
 * All props (except the ones listed below) will be passed directly to the wrapped component.
 */
export class Validator extends Component {
    static propTypes = {
        /** Validator function: `(value) => void`. Should throw props on error. */
        validate: PropTypes.func.isRequired,
        /** Value that will be validated. Will be passed to the wrapped component. */
        value: PropTypes.any,
        /** The component that will be created by this validator. */
        component: PropTypes.any.isRequired,
        children: PropTypes.any,
        /** Like a `ref`, but for the wrapped component. */
        innerRef: PropTypes.func
    };

    state = {
        translateX: 0,
        /**
         * The set of error props.
         * @type {Object|null}
         */
        error: null,
        /**
         *If true, will continuously check validity instead of only when validation is triggered
         * externally (such as by the Form being submitted).
         */
        continuous: false
    };

    translateX = new Spring(0.4, 0.3);

    constructor (props) {
        super(props);

        this.translateX.target = 0;
        this.translateX.tolerance = 1;
        this.translateX.on('update', translateX => this.setState({ translateX }));
    }

    /** Shakes the component to indicate an error. */
    shake () {
        this.translateX.velocity = 500;
        this.translateX.start();
    }

    /**
     * Validates the value using the `validate` prop.
     * @param {boolean} submitting - if true, will shake the component on error. Should be falsy
     *                               by default because the shaking animation is distracting.
     */
    validate (submitting) {
        try {
            this.props.validate(this.props.value);
            this.setState({ error: null, continuous: false });
            return true;
        } catch (error) {
            this.setState({ error, continuous: true });
            if (submitting) this.shake();
            return false;
        }
    }

    componentDidMount () {
        this.formContext.register(this);
    }

    componentWillUnmount () {
        this.formContext.deregister(this);
        this.translateX.stop();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.value != this.props.value && this.state.continuous) {
            this.validate();
        }
    }

    render () {
        const props = { ...this.props };
        delete props.validate;
        delete props.component;
        props.ref = this.props.innerRef;

        if (this.state.error) {
            Object.assign(props, this.state.error);
        }

        return (
            <FormContext.Consumer>
                {context => {
                    this.formContext = context;
                    return (
                        <span class="form-validator" style={{
                            transform: `translateX(${this.state.translateX}px)`
                        }}>
                            {h(this.props.component, props, this.props.children)}
                        </span>
                    );
                }}
            </FormContext.Consumer>
        );
    }
}
