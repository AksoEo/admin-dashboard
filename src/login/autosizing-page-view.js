import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { Spring, lerp } from '../animation';

/**
 * Container for multiple pages of varying height and fixed width.
 * Assumes fixed child count and mostly fixed child heights.
 *
 * Positive page indices will behave as expected and will be laid out in a linear fashion.
 * Negative page indices are meant for help pages and will always be positioned before page 0.
 */
export default class AutosizingPageView extends Component {
    static propTypes = {
        /** Currently selected page. */
        selected: PropTypes.number.isRequired,
        /** Smallest page index; determines mapping between child indices and page indices. */
        minIndex: PropTypes.number.isRequired,
        children: PropTypes.arrayOf(PropTypes.any).isRequired,
        /** Called when the current page changes; shortly before the animation finishes. */
        onPageChange: PropTypes.func,
    };

    state = {
        x: 0,
        height: 0,
    };

    /** Item refs and heights. */
    items = {};

    /** Previously selected page. */
    prevSelected = 0;

    xSpring = new Spring(1, 0.5);
    heightSpring = new Spring(1, 0.5);

    constructor (props) {
        super(props);

        this.xSpring.on('update', x => {
            if (Math.abs(x - this.props.selected) < 0.1 && !this.firedPageChange) {
                this.firedPageChange = true;
                this.props.onPageChange(this.props.selected);
            }
            this.setState({ x });
        });
        this.heightSpring.on('update', height => this.setState({ height }));
    }

    componentDidMount () {
        this.updatePageHeights();
        this.heightSpring.value = this.currentHeight();
        this.forceUpdate();

        // sometimes, the styles are applied *after* the vdom renders, so the page heights need
        // to be updated again
        setTimeout(() => this.pageHeightChanged(), 100);
    }

    componentWillUnmount () {
        this.xSpring.stop();
        this.heightSpring.stop();
    }

    componentWillUpdate (newProps) {
        if (newProps.selected != this.props.selected) {
            this.prevSelected = this.props.selected;
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.selected != this.props.selected) {
            this.xSpring.target = this.props.selected;
            this.xSpring.start();
            this.updatePageHeights();
            this.firedPageChange = false;
        }
    }

    /** Updates page heights from the DOM. */
    updatePageHeights () {
        for (const key in this.items) {
            const item = this.items[key];
            item.height = item.node.offsetHeight;
        }
    }

    /** Updates page heights and triggers a re-render. */
    pageHeightChanged () {
        this.updatePageHeights();
        this.forceUpdate();
    }

    /**
     * Returns the current height, i.e. the height of the current page or an interpolated value
     * when animating.
     */
    currentHeight () {
        const nonEuclidean = this.props.selected < 0 || this.prevSelected < 0;
        const a = nonEuclidean ? this.props.selected : Math.floor(this.state.x);
        const b = nonEuclidean ? this.prevSelected : Math.ceil(this.state.x);
        const t = nonEuclidean
            ? 1 - (this.state.x - this.prevSelected) / (this.props.selected - this.prevSelected)
            : this.state.x - a;
        if (this.items[a] && this.items[b]) {
            return Math.round(lerp(this.items[a].height, this.items[b].height, t));
        }
        return 0;
    }

    /** Returns a style object for a page with the given index. */
    pageStyle (index) {
        const offset = index < 0
            ? -1 + this.state.x / this.props.selected
            : index - this.state.x;
        if (Math.abs(offset) >= 1) return { visibility: 'hidden' };
        const visibility = index < 0
            ? (this.props.selected === index ? '' : 'hidden')
            : '';
        return { transform: `translateX(${offset * 100}%)`, visibility };
    }

    render () {
        const children = [];

        let index = this.props.minIndex;
        for (const child of this.props.children) {
            const i = index++;
            const prevItem = this.items[i];
            children.push(
                <div
                    class="autosizing-page"
                    ref={node => this.items[i] = { node, height: prevItem ? prevItem.height : 0}}
                    style={this.pageStyle(i)}>
                    {child}
                </div>
            );
        }

        return (
            <div class="autosizing-page-view" style={{ height: this.currentHeight() }}>
                {children}
            </div>
        );
    }
}
