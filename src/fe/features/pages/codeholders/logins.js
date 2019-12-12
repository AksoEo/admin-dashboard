import { h } from 'preact';
import { codeholders as locale } from '../../../locale';
import { coreContext } from '../../../core/connection';
import Page from '../../../components/page';
import DataList from '../../../components/data-list';
import data from '../../../components/data';
import Meta from '../../meta';
import './logins.less';

export default class LoginsPage extends Page {
    static contextType = coreContext;

    render () {
        // get codeholder id from the match above
        const id = +this.props.matches[this.props.matches.length - 2][1];

        return (
            <div class="codeholder-logins-page">
                <Meta title={locale.logins.title} />
                <DataList
                    onLoad={(offset, limit) =>
                        this.context.createTask('codeholders/listLogins', {
                            id,
                        }, { offset, limit }).runOnceAndDrop()}
                    emptyLabel={locale.logins.empty}
                    itemHeight={72}
                    renderItem={item => <LoginItem item={item} />} />
            </div>
        );
    }
}

function LoginItem ({ item }) {
    return (
        <div class="login-item" data-id={item.id}>
            <div class="login-time">
                <data.timestamp.inlineRenderer value={item.time * 1000} />
                {' '}
                {item.timezone}
            </div>
            <div class="login-id">
                {item.ip}
                {' '}
                {item.userAgentParsed}
            </div>
            <div class="login-loc">
                {item.country}
                {' '}
                {item.region}
                {' '}
                {item.city}
            </div>
        </div>
    );
}
