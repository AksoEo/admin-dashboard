import { h } from 'preact';
import { Link } from '../router';
import { IdUEACode } from './data/uea-code';
import './diff-author.less';

/// Renders a diff author, like `ch:1234` or `app:0123456abcdef`, with their proper name.
///
/// # Props
/// - author: author string
/// - interactive: bool
export default function DiffAuthor ({ author, interactive }) {
    if (typeof author !== 'string') return null;
    if (author.startsWith('ch:')) {
        const chId = +author.substr(3);
        if (interactive) {
            return <Link target={`/membroj/${chId}`} class="diff-author-link" outOfTree><IdUEACode id={chId} /></Link>;
        } else {
            <IdUEACode id={chId} />;
        }
    } else if (author.startsWith('app:')) {
        const appId = +author.substr(4);
        if (interactive) {
            return (
                <Link target={`/administrado/klientoj/${appId}`} class="diff-author-link">
                    <span class="diff-author-app-id">
                        {appId}
                    </span>
                </Link>
            );
        } else {
            return <span class="diff-author-app-id">{appId}</span>;
        }
    }
}
