import { h } from 'preact';
import Page from '../../../components/page';
import Meta from '../../meta';
import { LinkButton } from '../../../router';

export default class Administration extends Page {
    render () {
        const menu = [];

        return (
            <div class="administration-page">
                <Meta title="..." actions={menu} />
                <LinkButton target="/administrado/protokolo">(→ protokolo)</LinkButton>
            </div>
        );
    }
}
