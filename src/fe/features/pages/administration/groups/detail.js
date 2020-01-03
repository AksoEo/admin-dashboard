import { h } from 'preact';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import { adminGroups as locale } from '../../../../locale';

function Header () {
    return 'cats';
}
const fields = {};
function Footer () {
    return 'cats';
}

export default class AdminGroupDetailPage extends Page {
    render ({ match }) {
        const id = match[1];

        return (
            <div class="admin-group-detail-page">
                <Meta title={locale.detailTitle} />
                <DetailView
                    view="adminGroups/group"
                    id={id}
                    onDelete={() => this.props.pop()}
                    header={Header}
                    fields={fields}
                    footer={Footer}
                    locale={locale} />
            </div>
        );
    }
}
