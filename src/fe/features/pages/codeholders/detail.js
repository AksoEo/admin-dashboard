import { h } from 'preact';
import Page from '../../../components/page';
import DetailView from '../../../components/detail';
import Meta from '../../meta';
import { codeholders as locale } from '../../../locale';
import { Header, fields, Footer } from './detail-fields';

export default class Detail extends Page {
    render () {
        const { match } = this.props;
        const id = match[1];

        return (
            <div class="codeholder-detail-page">
                <Meta title={locale.detailTitle} />
                <DetailView
                    view="codeholders/codeholder"
                    id={id}
                    options={{
                        fields: [
                            'id',
                            'type',
                            'name',
                            'careOf',
                            'website',
                            'code',
                            'creationTime',
                            'hasPassword',
                            'address',
                            'feeCountry',
                            'membership',
                            'email',
                            'enabled',
                            'notes',
                            'officePhone',
                            'landlinePhone',
                            'cellphone',
                            'isDead',
                            'birthdate',
                            'age',
                            'deathdate',
                            'profilePictureHash',
                            'isActiveMember',
                            'profession',
                        ],
                    }}
                    header={Header}
                    fields={fields} />
            </div>
        );
    }
}
