import EventEmitter from 'events';

/// URL handling helper for list view pages.
///
/// # Events
/// - `navigate`(path: string): called whenever the browser should pushState
/// - `decodeURLQuery`(query: string): called whenever the list view should decode a url query
/// - `detail`(id: number|null): called whenever the open detail view changes
export default class URLHandler extends EventEmitter {
    /// Creates a new URL handler.
    ///
    /// - `base`: the absolute base URL (without a trailing slash)
    /// - `useDetailViews`: whether detail views are enabled
    constructor (base, useDetailViews) {
        super();
        this.base = base;
        this.useDetailViews = useDetailViews;
    }

    isQueryUnchanged (query) {
        return this.currentQuery === query
            || decodeURIComponent(this.currentQuery) === decodeURIComponent(query);
    }

    /// This function should be passed to the list view.
    onURLQueryChange = (query, force = false) => {
        if (this.isDetailView && !force) return;
        if (this.isQueryUnchanged(query) && !force) return;
        this.currentQuery = query;
        if (query) this.emit('navigate', this.base + '?q=' + query);
        else this.emit('navigate', this.base);
    };

    /// This function should be passed to the list view.
    getLinkTarget = id => this.base + '/' + id;

    /// This function should be passed to the list view.
    onDetailClose = () => {
        if (this.isDetailView) {
            this.onURLQueryChange(this.currentQuery, true);
        }
    };

    /// Call this whenever the path or query may have changed.
    update (path, query) {
        if (path !== this._decodedPath) {
            this.tryDecodePath(path);
        }
        if (!this.isQueryUnchanged(query)) {
            this.tryDecodeURLQuery(query);
        }
    }

    /// Attempts to decode the URL query to get the search parameters.
    tryDecodeURLQuery (iquery) {
        if (this.isDetailView) return;
        if (!iquery && this.currentQuery) {
            this.currentQuery = '';
            this.emit('decodeURLQuery', '');
            return;
        }
        if (!iquery.startsWith('?q=')) return;
        const query = iquery.substr(3);
        if (this.isQueryUnchanged(query)) return;
        this.currentQuery = query;

        try {
            this.emit('decodeURLQuery', query);
        } catch (err) {
            // TODO: error?
            console.error('Failed to decode URL query', err); // eslint-disable-line no-console
        }
    }

    /// Attempts to decode the path to get the currently open detail view.
    tryDecodePath (path) {
        this._decodedPath = path;
        const subpath = path.substr(this.base.length);
        const detailView = subpath.match(/^\/+(\d+)(\/|$)/);
        this.isDetailView = !!detailView;
        if (detailView) {
            this.emit('detail', +detailView[1]);
        } else {
            this.emit('detail', null);
        }
    }
}
