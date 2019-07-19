import React from 'react';
import PropTypes from 'prop-types';
import TablePagination from '@material-ui/core/TablePagination';
import locale from '../../locale';

// TODO: fix locale

/// Renders the list view results.
export default function Results ({
    list,
    items,
    page,
    itemsPerPage,
    isRestrictedByGlobalFilter,
    time,
    isFiltered,
    totalItems,
    onSetPage,
    onSetItemsPerPage,
}) {
    const count = list ? list.length : 0;
    const statsText = locale.members.resultStats(count, isFiltered, totalItems || 0, time || '?');

    return (
        <div className="list-view-results">
            {time ? (
                <div className="result-stats">
                    {statsText}
                </div>
            ) : null}
            {isRestrictedByGlobalFilter ? (
                <div className="global-filter-notice">
                    {locale.members.globalFilterNotice}
                </div>
            ) : null}
            {count ? (
                <div className="results-list">
                    TODO
                </div>
            ) : time ? (
                <div className="no-results">
                    {locale.members.noResults}
                </div>
            ) : null}
            {totalItems ? (
                <TablePagination
                    className="table-pagination"
                    component="div"
                    count={totalItems}
                    labelDisplayedRows={locale.members.pagination.displayedRows}
                    labelRowsPerPage={locale.members.pagination.rowsPerPage}
                    page={page}
                    rowsPerPage={itemsPerPage}
                    onChangePage={(e, page) => onSetPage(page)}
                    onChangeRowsPerPage={e => onSetItemsPerPage(e.target.value)} />
            ) : null}
        </div>
    );
}

Results.propTypes = {
    list: PropTypes.array,
    items: PropTypes.object,
    page: PropTypes.number,
    itemsPerPage: PropTypes.number,
    isRestrictedByGlobalFilter: PropTypes.bool,
    time: PropTypes.number,
    isFiltered: PropTypes.bool,
    totalItems: PropTypes.number,
    onSetPage: PropTypes.func,
    onSetItemsPerPage: PropTypes.func,
};

export function ErrorResult ({ error }) {
    let errorIsLocalized = false;
    let errorDetails = error.toString();

    switch (error.id) {
    case 'invalid-search-query':
        errorIsLocalized = true;
        errorDetails = locale.members.errors.invalidSearchQuery;
        break;
    case 'invalid-json':
        errorIsLocalized = true;
        errorDetails = locale.members.errors.invalidJSON;
        break;
    }

    return (
        <div className="list-error">
            <div className="error-title">
                {locale.members.error}
            </div>
            {errorIsLocalized ? (
                <div className="error-details">
                    {errorDetails}
                </div>
            ) : (
                <pre className="error-details">
                    {errorDetails}
                </pre>
            )}
        </div>
    );
}

ErrorResult.propTypes = {
    error: PropTypes.any.isRequired,
};
