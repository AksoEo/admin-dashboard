import { h } from 'preact';
import Page from '../../../components/page';
import Meta from '../../meta';
import { memberships as locale } from '../../../locale';
import { LinkButton } from '../../../router';
import { connectPerms } from '../../../perms';

export default connectPerms(class Memberships extends Page {
    render ({ perms }) {
        return (
            <div class="memberships-page">
                <Meta
                    title={locale.title}
                    actions={[]} />
                <LinkButton target="/membreco/kategorioj">
                    -&gt; categories &lt;-
                </LinkButton>
                <LinkButton target="/membreco/agordoj">
                    -&gt; options &lt;-
                </LinkButton>
            </div>
        );
    }
});
