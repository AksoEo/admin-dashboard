import { h } from 'preact';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Button } from 'yamdl';
import TablePagination from '@material-ui/core/TablePagination';
import SearchIcon from '@material-ui/icons/Search';
import ListAltIcon from '@material-ui/icons/ListAlt';
import locale from '../../locale';
import Sorting from './sorting';
import { Link } from '../../router';

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
    fields,
    transientFields,
    fieldSpec,
    configColumn,
    onEditFields,
    onAddField,
    onSetFieldSorting,
    localizedFields,
    getLinkTarget,
}) {
    const count = list ? list.length : 0;
    const statsText = locale.listView.resultStats(count, isFiltered, totalItems || 0, time || '?');

    return (
        <div className="list-view-results">
            {time ? (
                <div className="result-stats">
                    {statsText}
                </div>
            ) : null}
            {isRestrictedByGlobalFilter ? (
                <div className="global-filter-notice">
                    {locale.listView.globalFilterNotice}
                </div>
            ) : null}
            {count ? (
                <div className="results-list">
                    <ResultsTable
                        list={list}
                        items={items}
                        fields={fields}
                        transientFields={transientFields}
                        fieldSpec={fieldSpec}
                        configColumn={configColumn}
                        onEditFields={onEditFields}
                        onAddField={onAddField}
                        onSetFieldSorting={onSetFieldSorting}
                        localizedFields={localizedFields}
                        getLinkTarget={getLinkTarget} />
                    {totalItems ? (
                        <TablePagination
                            className="table-pagination"
                            component="div"
                            count={totalItems}
                            labelDisplayedRows={locale.listView.pagination.displayedRows}
                            labelRowsPerPage={locale.listView.pagination.rowsPerPage}
                            page={page}
                            rowsPerPage={itemsPerPage}
                            onChangePage={(e, page) => onSetPage(page)}
                            onChangeRowsPerPage={e => onSetItemsPerPage(e.target.value)} />
                    ) : null}
                </div>
            ) : time ? (
                <div className="no-results">
                    {locale.listView.noResults}
                </div>
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
    fields: PropTypes.object.isRequired,
    transientFields: PropTypes.array.isRequired,
    fieldSpec: PropTypes.object.isRequired,
    configColumn: PropTypes.string,
    onEditFields: PropTypes.func.isRequired,
    onAddField: PropTypes.func.isRequired,
    onSetFieldSorting: PropTypes.func.isRequired,
    localizedFields: PropTypes.object.isRequired,
    getLinkTarget: PropTypes.func.isRequired,
};

export function ErrorResult ({ error }) {
    let errorIsLocalized = false;
    let errorDetails = error.toString();

    switch (error.id) {
    case 'invalid-search-query':
        errorIsLocalized = true;
        errorDetails = (
            <div className="invalid-search-query-error">
                {locale.listView.errors.invalidSearchQuery.pre.map((x, i) => (<p key={i}>{x}</p>))}
                <ul>
                    {locale.listView.errors.invalidSearchQuery.list.map(([x, y], i) => (
                        <li key={i}><code>{x}</code>{y}</li>
                    ))}
                </ul>
                {locale.listView.errors.invalidSearchQuery.post.map((x, i) => (<p key={i}>{x}</p>))}
            </div>
        );
        break;
    case 'invalid-json':
        errorIsLocalized = true;
        errorDetails = locale.listView.errors.invalidJSON;
        break;
    }

    return (
        <div className="list-view-error">
            <div className="error-title">
                {locale.listView.error}
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

function ResultsTable ({
    list,
    items,
    fields,
    transientFields,
    fieldSpec,
    configColumn,
    onEditFields,
    onAddField,
    onSetFieldSorting,
    localizedFields,
    getLinkTarget,
}) {
    const selectedFields = fields.user.map((field, i) => ({ ...field, index: i }));
    const selectedFieldIds = selectedFields.map(x => x.id);

    // prepend temporary fields that aren’t already selected
    for (let i = transientFields.length - 1; i >= 0; i--) {
        const tmpId = transientFields[i];
        if (!selectedFieldIds.includes(tmpId)) {
            selectedFieldIds.push(tmpId);
            selectedFields.unshift({ id: tmpId, sorting: Sorting.NONE, transient: true });
        }
    }

    // also prepend fixed fields
    for (let i = fields.fixed.length - 1; i >= 0; i--) {
        selectedFields.unshift(fields.fixed[i]);
    }

    const fieldIDs = selectedFields.map(field => field.id);

    return (
        <Table className="results-table">
            <TableHeader
                fields={selectedFields}
                fieldSpec={fieldSpec}
                configColumn={configColumn}
                onEditFields={onEditFields}
                onAddField={onAddField}
                onSetFieldSorting={onSetFieldSorting}
                localizedFields={localizedFields} />
            <TableBody>
                {list.map(id => (
                    <TableItem
                        key={id}
                        fields={fieldIDs}
                        fieldSpec={fieldSpec}
                        value={items[id]}
                        linkTarget={getLinkTarget(id)} />
                ))}
            </TableBody>
        </Table>
    );
}

ResultsTable.propTypes = {
    list: PropTypes.array.isRequired,
    items: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    transientFields: PropTypes.array.isRequired,
    fieldSpec: PropTypes.object.isRequired,
    configColumn: PropTypes.string,
    onEditFields: PropTypes.func.isRequired,
    onAddField: PropTypes.func.isRequired,
    onSetFieldSorting: PropTypes.func.isRequired,
    localizedFields: PropTypes.object.isRequired,
    getLinkTarget: PropTypes.func.isRequired,
};

function TableHeader ({
    fields,
    fieldSpec,
    configColumn,
    onEditFields,
    onAddField,
    onSetFieldSorting,
    localizedFields,
}) {
    return (
        <TableHead className="table-header">
            <TableRow>
                {fields.map(({ id, sorting, transient, index }) => {
                    if (id === configColumn) {
                        return (
                            <TableCell key={id} className="table-header-fields-btn-container">
                                <Button
                                    icon
                                    key={id}
                                    class="table-header-fields-btn"
                                    aria-label={locale.listView.fieldPicker.title}
                                    title={locale.listView.fieldPicker.title}
                                    onClick={onEditFields}>
                                    <ListAltIcon />
                                </Button>
                            </TableCell>
                        );
                    } else {
                        const sortDirection = sorting === Sorting.NONE
                            ? false
                            : sorting === Sorting.ASC ? 'asc' : 'desc';

                        return (
                            <TableCell
                                className={'table-header-field' + (transient ? ' transient' : '')}
                                key={id}
                                sortDirection={sortDirection}>
                                {transient && <SearchIcon className="transient-field-icon" />}
                                <TableSortLabel
                                    active={!!sortDirection}
                                    direction={sortDirection || 'asc'}
                                    onClick={() => {
                                        if (transient) {
                                            onAddField(id, true);
                                        } else if (fieldSpec[id] && fieldSpec[id].sortable) {
                                            const newSorting = sorting === Sorting.NONE
                                                ? Sorting.ASC
                                                : sorting === Sorting.ASC
                                                    ? Sorting.DESC
                                                    : Sorting.NONE;
                                            onSetFieldSorting(index, newSorting);
                                        }
                                    }}>
                                    {localizedFields[id]}
                                </TableSortLabel>
                            </TableCell>
                        );
                    }
                })}
            </TableRow>
        </TableHead>
    );
}

TableHeader.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    fieldSpec: PropTypes.object.isRequired,
    configColumn: PropTypes.string,
    onEditFields: PropTypes.func.isRequired,
    onAddField: PropTypes.func.isRequired,
    onSetFieldSorting: PropTypes.func.isRequired,
    localizedFields: PropTypes.object.isRequired,
};

function TableItem ({ fields, fieldSpec, value, onClick, linkTarget }) {
    let className = 'list-item';
    if (value.isCursed) className += ' is-cursed';

    return (
        <TableRow className={className} onClick={onClick}>
            {fields.map(id => {
                const Field = (fieldSpec[id] && fieldSpec[id].component) || NullField;
                return (
                    <TableCell className="li-column" key={id}>
                        <Link
                            target={linkTarget}
                            className="li-link"
                            onClick={e => {
                                if (e.shiftKey || e.metaKey || e.ctrlKey) return;
                                e.preventDefault();
                            }}>
                            <Field
                                field={id}
                                value={value[id]}
                                item={value}
                                fields={fields} />
                        </Link>
                    </TableCell>
                );
            })}
        </TableRow>
    );
}

TableItem.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    fieldSpec: PropTypes.object.isRequired,
    value: PropTypes.any,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    onSelectChange: PropTypes.func.isRequired,
    linkTarget: PropTypes.string,
};

function NullField ({ field }) {
    return <code>missing field component for {field}</code>;
}
NullField.propTypes = { field: PropTypes.any };
