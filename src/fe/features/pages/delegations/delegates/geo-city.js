import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import ErrorIcon from '@material-ui/icons/Error';
import { connect } from '../../../../core/connection';
import TinyProgress from '../../../../components/tiny-progress';
import { country } from '../../../../components/data';
import { data as locale } from '../../../../locale';

export default connect(
    ({ id }) => ['geoDb/city', { id }],
    ['id']
)((data, _, err) => ({ data, err }))(class GeoCity extends PureComponent {
    render ({ data, err }) {
        if (err) return <ErrorIcon style={{ verticalAlign: 'middle' }}/>;
        if (!data) return <TinyProgress />;
        return (
            <span class="geo-city" title={`WikiData ${data.id}`}>
                {data.nativeLabel ? (
                    <span class="native-label">
                        {data.nativeLabel}
                    </span>
                ) : (
                    <span class="native-label is-missing">
                        {locale.geoDb.nativeLabelMissing}
                    </span>
                )}
                {data.eoLabel ? (
                    <span class="eo-label">
                        ({data.eoLabel})
                    </span>
                ) : null}
                <span class="gc-subdivision">
                    {data.subdivision_eoLabel || data.subdivision_nativeLabel}
                </span>
                <span class="gc-country">
                    <country.renderer value={data.country} />
                </span>
            </span>
        );
    }
});
