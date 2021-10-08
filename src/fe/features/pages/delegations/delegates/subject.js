import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import ErrorIcon from '@material-ui/icons/Error';
import { connect } from '../../../../core/connection';
import TinyProgress from '../../../../components/tiny-progress';

export default connect(
    ({ id }) => ['delegations/subject', { id }],
    ['id']
)((data, _, err) => ({ data, err }))(class Subject extends PureComponent {
    render ({ data, err }) {
        if (err) return <ErrorIcon style={{ verticalAlign: 'middle' }} />;
        if (!data) return <TinyProgress />;
        return data.name;
    }
});
