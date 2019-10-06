import { h, Component } from 'preact';
import { Spring } from '@cpsdqs/yamdl';
import { lerp } from '@cpsdqs/yamdl/src/animation'; // FIXME: remove this

/// Login progress indicator.
/// Assumes that the children will never change.
/// If `selected` is `-2`, will render `helpLabel`.
///
/// # Props
/// - selected: number
/// - children: list of vnodes
/// - helpLabel: vnode
export default class ProgressIndicator extends Component {
    state = { offset: 0, currentNodeWidth: 0 };
    spring = new Spring(1, 0.5);
    nodes = [];

    constructor (props) {
        super(props);

        this.spring.on('update', offset => this.setState({ offset }));
    }

    updateNodeWidths () {
        for (const node of this.nodes) {
            node.width = node.node.offsetWidth;
        }
    }

    updateCurrentNodeWidth () {
        const leftIndex = Math.max(0, Math.floor(this.state.offset));
        const rightIndex = Math.max(0, Math.ceil(this.state.offset));
        const left = this.nodes[leftIndex].width;
        const right = this.nodes[rightIndex].width;
        const p = Math.max(0, this.state.offset) - leftIndex;
        const currentNodeWidth = lerp(left, right, p);
        if (currentNodeWidth !== this.state.currentNodeWidth) {
            this.setState({ currentNodeWidth });
        }
    }

    componentDidMount () {
        this.spring.target = this.props.selected;
        this.spring.start();

        this.updateNodeWidths();
        this.updateCurrentNodeWidth();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.selected !== this.props.selected) {
            this.spring.target = this.props.selected;
            this.spring.start();
        }

        this.updateCurrentNodeWidth();
    }

    componentWillUnmount () {
        this.spring.stop();
    }

    /// Returns styles for an item at the given index.
    itemStyle (index) {
        const offset = index - this.state.offset;
        const nodeWidth = this.nodes[index] ? this.nodes[index].width : 0;
        const dx = offset * ((this.state.currentNodeWidth + nodeWidth) / 2 + 10);
        const scale = 1 - (offset / 2) ** 2;
        const opacity = Math.max(0, Math.min(-Math.abs(offset) + 1.5, 1));

        return {
            transform: `translateX(${dx}px) translateX(-50%) scale(${scale})`,
            opacity,
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
                    ref={node => node && (this.nodes[i] = { node, width: node.offsetWidth })}
                    style={this.itemStyle(i)}>
                    {child}
                </div>
            );
        }

        return (
            <div class="login-progress">
                {items}
            </div>
        );
    }
}
