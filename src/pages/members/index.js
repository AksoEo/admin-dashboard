import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import PredicateEditor from './predicate-editor';
import locale from '../../locale';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    render () {
        return (
            <div className="app-page members-page">
                <MembersSearch />
            </div>
        );
    }
}

class MembersSearch extends React.PureComponent {
    state = {
        predicates: []
    };

    render () {
        return (
            <div className="members-search">
                <div className="search-contents">
                    <div className="search-title">{locale.members.search.title}</div>
                    <div className="search-box">
                        <input
                            className="search-input"
                            placeholder={locale.members.search.placeholder} />
                        <IconButton className="search-button">
                            <SearchIcon />
                        </IconButton>
                    </div>
                    <div className="search-filters">
                        <PredicateEditor
                            value={this.state.predicates}
                            onChange={predicates => this.setState({ predicates })}
                            placeholder={locale.members.search.placeholder}
                            addPlaceholder={locale.members.search.addPredicate} />
                    </div>
                </div>
            </div>
        );
    }
}
