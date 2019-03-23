import React from 'react';
import PredicateEditor from './predicate-editor';
import locale from '../../locale';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    state = {
        predicates: []
    };

    render () {
        return (
            <div className="app-page members-page">
                <PredicateEditor
                    value={this.state.predicates}
                    onChange={predicates => this.setState({ predicates })}
                    placeholder={locale.members.search.placeholder}
                    addPlaceholder={locale.members.search.addPredicate} />
            </div>
        );
    }
}
