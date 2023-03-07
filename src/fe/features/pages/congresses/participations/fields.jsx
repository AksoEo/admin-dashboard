import { h } from 'preact';
import { useDataView } from '../../../../core';
import TinyProgress from '../../../../components/controls/tiny-progress';
import DisplayError from '../../../../components/utils/error';

export const FIELDS = {
    congressId: {
        sortable: true,
        component ({ value }) {
            return <CongressName id={value} />;
        },
    },
    congressInstanceId: {
        sortable: true,
        component ({ value, item }) {
            return <CongressInstanceName id={value} congress={item.congressId} />;
        },
    },
    dataId: {
        sortable: true,
        component ({ value }) {
            return (
                <span class="congress-participant-data-id">
                    <span class="inner-data-id">{value}</span>
                </span>
            );
        },
    },
};

function CongressName ({ id }) {
    const [loading, error, data] = useDataView('congresses/congress', { id });

    if (loading) return <TinyProgress />;
    if (error) return <DisplayError error={error} />;
    if (!data) return null;

    return <span>{data.name}</span>;
}

function CongressInstanceName ({ congress, id }) {
    const [loading, error, data] = useDataView('congresses/instance', { congress, id });

    if (loading) return <TinyProgress />;
    if (error) return <DisplayError error={error} />;
    if (!data) return null;

    return <span>{data.name}</span>;
}