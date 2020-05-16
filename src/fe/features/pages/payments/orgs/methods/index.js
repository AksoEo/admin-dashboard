import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import OverviewList from '../../../../../components/overview-list';
import { paymentMethods as locale } from '../../../../../locale';
import { FIELDS } from './fields';

export default class MethodsTab extends PureComponent {
    state = {
        parameters: {
            fields: [
                { id: 'type', sorting: 'none', fixed: true },
                { id: 'name', sorting: 'none', fixed: true },
                { id: 'description', sorting: 'none', fixed: true },
            ],
            offset: 0,
            limit: 10,
        },
    };

    render ({ org }, { parameters }) {
        return (
            <div class="payment-methods-tab">
                <OverviewList
                    task="payments/listMethods"
                    view="payments/method"
                    options={{ org }}
                    viewOptions={{ org }}
                    parameters={parameters}
                    fields={FIELDS}
                    onGetItemLink={id => `/pagoj/organizoj/${org}/[[methods]]/${id}`}
                    onSetOffset={offset => this.setState({ parameters: { ...parameters, offset }})}
                    onSetLimit={limit => this.setState({ parameters: { ...parameters, limit }})}
                    locale={locale.fields} />
            </div>
        );
    }
}
