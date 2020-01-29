import { h } from 'preact';
import Page from '../../../../components/page';
import DetailView from '../../../../components/detail';
import Meta from '../../../meta';
import FIELDS from './detail-fields';
import { httpLog as locale } from '../../../../locale';

const availableFields = [
    'id',
    'time',
    'codeholder',
    'apiKey',
    'ip',
    'origin',
    'userAgent',
    'userAgentParsed',
    'method',
    'path',
    'query',
    'resStatus',
    'resTime',
    'resLocation',
];

export default class HttpLogDetailPage extends Page {
    render ({ match }) {
        const id = +match[1];

        return (
            <div class="http-log-detail-page">
                <Meta title={locale.detailTitle} />
                <DetailView
                    view="httpLog/request"
                    id={id}
                    options={{ fields: availableFields }}
                    fields={FIELDS}
                    locale={locale} />
            </div>
        );
    }
}
