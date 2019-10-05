import { h, Component } from 'preact';
import { AppBarProxy } from 'yamdl';
import APILogListView from './log';

export default class Administration extends Component {
    render () {
        const menu = [];

        return (
            <div class="app-page administration-page" ref={node => this.node = node}>
                <AppBarProxy actions={menu} priority={1} />
                <APILogListView path={this.props.path} query={this.props.query} />
            </div>
        );
    }
}
