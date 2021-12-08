import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import ErrorIcon from '@material-ui/icons/Error';
import { connect } from '../../../../core/connection';
import TinyProgress from '../../../../components/controls/tiny-progress';
import { country } from '../../../../components/data';
import { data as locale } from '../../../../locale';
import './geo-city.less';

export default connect(
    ({ id }) => ['geoDb/city', { id }],
    ['id']
)((data, _, err) => ({ data, err }))(class GeoCity extends PureComponent {
    render ({ data, err, short, ...extra }) {
        if (err) return <ErrorIcon style={{ verticalAlign: 'middle' }}/>;
        if (!data) return <TinyProgress />;

        extra.class = (extra.class || '') + ' delegate-geo-city';

        return (
            <span title={`WikiData ${data.id}`} {...extra}>
                {data.nativeLabel ? (
                    <span class="native-label">
                        {data.nativeLabel}
                    </span>
                ) : (
                    <span class="native-label is-missing">
                        {locale.geoDb.nativeLabelMissing}
                    </span>
                )}
                {!short ? (
                    <Fragment>
                        {data.eoLabel ? (
                            <span class="eo-label">
                                {' '}
                                ({data.eoLabel})
                            </span>
                        ) : null}
                        <div class="gc-location">
                            <span class="gc-subdivision">
                                {data.subdivision_eoLabel || data.subdivision_nativeLabel}
                            </span>
                            {' '}
                            <span class="gc-country">
                                <country.renderer value={data.country} />
                            </span>
                        </div>
                    </Fragment>
                ) : null}
            </span>
        );
    }
});
