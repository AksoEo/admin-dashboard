import { h } from 'preact';
import DataList from '../../components/data-list';
import client from '../../client';

// TODO

const loadFiles = id => async (offset, limit) => {
    const res = await client.get(`/codeholders/${id}/files`, {
        offset,
        limit,
        fields: ['id', 'time', 'addedBy', 'name', 'description', 'mime'],
    });

    return { items: res.body, totalItems: +res.res.headers['x-total-items'] };
};

export default function Files ({ id }) {
    return <DataList
        class="member-files"
        onLoad={loadFiles(id)}
        renderItem={item => (
            <div class="member-file">
                {Object.entries(item)}
            </div>
        )} />;
}
