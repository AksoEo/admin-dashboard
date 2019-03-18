import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { Spring } from '../animation';

/**
 * Login progress indicator.
 * Assumes that the children will never change.
 * If `selected` is `-2`, will render `helpLabel`.
 */
export default class ProgressIndicator extends Component {
    static propTypes = {
        selected: PropTypes.number.isRequired,
        children: PropTypes.arrayOf(PropTypes.any).isRequired,
        helpLabel: PropTypes.any.isRequired
    };

    state = { offset: 0 };
    spring = new Spring(1, 0.5);
    nodes = [];
    maxNodeWidth = 0;

    constructor (props) {
        super(props);

        this.spring.on('update', offset => this.setState({ offset }));
    }

    componentDidMount () {
        for (const node of this.nodes) {
            this.maxNodeWidth = Math.max(this.maxNodeWidth, node.offsetWidth);
        }
        this.forceUpdate();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.selected != this.props.selected) {
            this.spring.target = this.props.selected;
            this.spring.start();
        }
    }

    componentWillUnmount () {
        this.spring.stop();
    }

    /** Returns styles for an item at the given index. */
    itemStyle (index) {
        const offset = index - this.state.offset;
        const dx = offset * this.maxNodeWidth;
        const scale = 1 - (offset / 2) ** 2;
        const opacity = Math.max(0, Math.min(-Math.abs(offset) + 1.5, 1));

        return {
            transform: `translateX(${dx}px) translateX(-50%) scale(${scale})`,
            opacity
        };
    }

    render () {
        const items = [];
        let index = 0;
        for (const child of this.props.children) {
            const i = index++;
            items.push(
                <div
                    key={i}
                    class="login-progress-item"
                    ref={node => this.nodes[i] = node}
                    style={this.itemStyle(i)}>
                    {child}
                </div>
            );
        }

        items.push(
            <div key={-2} class="login-progress-item" style={this.itemStyle(-2)}>
                {this.props.helpLabel}
            </div>
        );

        return (
            <div class="login-progress">
                {items}
            </div>
        );
    }
}
