import { h } from 'preact';
import './error.less';
import { errors as locale } from '../locale';

/// Renders an error.
export default function DisplayError ({ error }) {
    if (error.code === 'invalid-search-query') {
        return (
            <div class="display-error is-invalid-search-query">
                {locale.invalidSearchQuery.pre.map((x, i) => <p key={i}>{x}</p>)}
                <ul>
                    {locale.invalidSearchQuery.list.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
                {locale.invalidSearchQuery.post.map((x, i) => <p key={i}>{x}</p>)}
            </div>
        );
    }

    let errorString = (
        <details>
            <summary>{locale.unknown}</summary>
            <pre>
                {'' + error}
            </pre>
        </details>
    );

    if (error.code === 'bad-request') {
        errorString = (
            <details>
                <summary>{locale[error.code]}</summary>
                <pre>
                    {error.message}
                </pre>
            </details>
        );
    } else if (error.code && locale[error.code]) {
        if (typeof locale[error.code] === 'function') {
            errorString = locale[error.code](error);
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
