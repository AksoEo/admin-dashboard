import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './style';

export default class DetailView extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
        id: PropTypes.any,
    };

    render () {
        const { id, open, onClose } = this.props;

        return (
            <div className={'detail-view-container' + (open ? '' : ' closed')}>
                <div className="detail-view-backdrop" onClick={onClose} />
                <div className="detail-view">
                    <DetailViewTemporaryInner id={id} />
                </div>
            </div>
        );
    }
}

const DetailViewTemporaryInner = connect(state => ({
    items: state.items,
}))(function DetailViewTemporaryInner ({ items, id }) {
    if (!id) return null;
    if (!items[id]) return (
        <h3 style={{ marginLeft: '24px', marginRight: '24px' }}>
            The detail view is work-in-progress and can’t load itself yet.
            Please re-open it from the list
        </h3>
    );

    const item = items[id];

    const name = item.codeholderType === 'human'
        ? `${item.firstNameLegal} ${item.lastNameLegal}`
        : item.fullName;

    return (
        <div className="tmp">
            <div className="tmp-3">
                <div className="tmp-2"></div>
                <div className="tmp-1">
                    <h1 className="tmp-4">{name}</h1>
                    <div className="tmp-5">{item.newCode}</div>
                </div>
            </div>
            {[...Array(16)].map((_, i) => (
                <div className="tmp-6" key={i}>
                    <div className="tmp-7"></div>
                    <div className="tmp-8" style={{ width: `${30 + Math.random() * 20}%` }}></div>
                </div>
            ))}
        </div>
    );
});
