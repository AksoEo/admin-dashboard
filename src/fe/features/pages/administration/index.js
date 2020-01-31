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
                temp index page
                <LinkButton target="/administrado/grupoj">(→ grupoj)</LinkButton>
                <LinkButton target="/administrado/klientoj">(→ klientoj)</LinkButton>
                <LinkButton target="/administrado/protokolo">(→ protokolo)</LinkButton>
                <LinkButton target="/administrado/landoj">(→ landoj)</LinkButton>
                <LinkButton target="/administrado/landgrupoj">(→ landgrupoj)</LinkButton>
            </div>
        );
    }
}
