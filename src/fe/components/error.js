import { h } from 'preact';
import './error.less';
import { errors as locale } from '../locale';

/// Renders an error.
export default function DisplayError ({ error }) {
    if (error.code === 'invalid-search-query') {
        return (
            <div class="display-error is-invalid-search-query">
                <p>{locale.invalidSearchQuery.pre}</p>
                <ul>
                    {locale.invalidSearchQuery.list.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
                <p>{locale.invalidSearchQuery.post}</p>
            </div>
        );
    }

    let errorString = locale.unknown('' + error);
    if (error.code && locale[error.code]) {
        if (typeof locale[error.code] === 'function') {
            errorString = locale[error.code](error.message);
        } else {
            errorString = locale[error.code];
        }
    }

    return (
        <div class="display-error">
            {errorString}
        </div>
    );
}
