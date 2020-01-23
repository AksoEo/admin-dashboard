import { h } from 'preact';
import Page from '../../../../components/page';
import Meta from '../../../meta';
import { clients as locale } from '../../../../locale';

export default class ClientDetailPage extends Page {
    render () {
        return (
            <div class="client-detail-page">
                <Meta title={locale.detailTitle} />

                perms and stuff
            </div>
        );
    }
}
