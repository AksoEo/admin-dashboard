import { h, Component } from 'preact';
import { Spring } from 'yamdl';
import FormContext from './context';
import './validator.less';

const isProbablyProd = location.hostname.includes('akso.org');

/// Validation wrapper around any component that uses `value`.
/// Must be used inside a Form component.
///
/// # Props
/// - validate: validator function `(value) => void`. Should throw partial props on error.
/// - value: value that will be validated. will be passed to the wrapped component
/// - component: the component that will be created by this validator
/// - innerRef: like a ref, but for the inner wrapped component
///
/// All other props will be passed directly to the wrapped component.
///
/// # Examples
/// ```jsx
/// <Validator
///     // this can be any kind of component
///     component={TextField}
///     value={state.value}
///     // this will be called at appropriate times to see if a value is valid
///     validate={value => {
///         // if the value is invalid, the thrown object will be appended as props
///         if (!isValid(value)) throw { error: 'invalid', style: { color: 'red' } };
///     }} />
/// ```
///
/// Additionally, there is a `shake` method for shaking the validator manually.
export default class Validator extends Component {
    state = {
        translateX: 0,
        /// The set of error props.
        /// @type {Object|null}
        error: null,
        /// If true, will continuously check validity instead of only when validation is triggered
        /// externally (such as by the Form being submitted).
        continuous: false,
    };

    static contextType = FormContext;

    translateX = new Spring(0.4, 0.3);

    constructor (props) {
        super(props);

        this.translateX.target = 0;
        this.translateX.tolerance = 1;
        this.translateX.on('update', translateX => this.setState({ translateX }));
    }

    /// Shakes the component to indicate an error.
    shake () {
        this.translateX.velocity = 500;
        this.translateX.start();
        this.node?.scrollIntoView && this.node.scrollIntoView();
    }

    /** Manually sets an error. */
    setError (error) {
        this.setState({ error, continuous: true });
    }

    /// Validates the value using the `validate` prop.
    /// @param {boolean} submitting - if true, will shake the component on error. Should be falsy
    ///                               by default because the shaking animation is distracting.
    validate (submitting) {
        try {
            this.props.validate(this.props.value);
            this.setState({ error: null, continuous: false });
            return true;
        } catch (error) {
            this.setError(error);
            if (submitting) this.shake();
            return false;
        }
    }

    componentDidMount () {
        console.warn('<Validator> is deprecated!'); // eslint-disable-line no-console
        this.context.register(this);
    }

    componentWillUnmount () {
        this.context.deregister(this);
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
        const { validatorProps } = props;
        if (validatorProps && ('class' in validatorProps)) validatorProps.class += ' form-validator';
        delete props.validatorProps;
        props.ref = this.props.innerRef;

        if (this.state.error) {
            Object.assign(props, this.state.error);
        }

        let className = 'form-validator';
        if (!isProbablyProd) className += ' is-debug-deprecated';

        return (
            <span class={className} ref={node => this.node = node} style={{
                transform: `translateX(${this.state.translateX}px)`,
            }} {...validatorProps}>
                {h(this.props.component, props, this.props.children)}
            </span>
        );
    }
}

