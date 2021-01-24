import { h } from 'preact';
import Page from '../../../components/page';
import Meta from '../../meta';
import { memberships as locale } from '../../../locale';
import { LinkButton } from '../../../router';
import { connectPerms } from '../../../perms';
import './index.less';

export default connectPerms(class Memberships extends Page {
    render ({ perms }) {
        return (
            <div class="memberships-page">
                <Meta
                    title={locale.title}
                    actions={[]} />
                {perms.hasPerm('membership_categories.read') && (
                    <LinkButton class="page-item" target="/membreco/kategorioj">
                        {locale.pages.categories}
                    </LinkButton>
                )}
                {perms.hasPerm('registration.options.read') && (
                    <LinkButton class="page-item" target="/membreco/agordoj">
                        {locale.pages.options}
                    </LinkButton>
                )}
            </div>
        );
    }
});
