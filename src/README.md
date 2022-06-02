# AKSO Bus Problem Prevention Initiative
The AKSO admin frontend consists of two parts: the core (`core/`) and the web frontend (`fe/`).
The core handles all communication with the backend API and provides an easier interface for the web frontend.

## The Core
The application core is a web worker and contains two primitives: tasks and data views.
Tasks represent failable actions (usually an API request), and data views are a live view of some data in the cache.
This is a web worker so logging out and deleting the cache is very easy.

Both tasks and data views are identified by a path such as `login/hasPassword` (which might check if a user has a password). Path scopes may be lazy-loaded (see `src/core/paths/index.js`).

### Tasks
Tasks have a very specific lifecycle:

1. they are created with a set of immutable `options` and a set of mutable `parameters`
2. `parameters` may be updated at this stage
3. the task is run
    - if it succeeds, it will return the result and drop itself (dropping: see memory management)
    - if it fails, it will return to step 2

In code, tasks are simply async functions that will be called by *the system* with the given options and parameters.
The immutable options/mutable parameters distinction exists to facilitate semantics for task views (see frontend).

Unknown options or parameters will be ignored (this can be used e.g. to pass user data to task views).

When implementing tasks, try using the task templates provided in `templates.js` as they cover almost all use cases.

### Views
Views act like React props in that they are simply observed data that might change over time and can’t be mutated directly (to mutate the data, one would use a task).

In general, views should be kept lean and shouldn’t be responsible for too much data—for example, a list of some complex data would use one view with the list item identifiers and the properties of the list items would be read from several other views, one for each item. A decent heuristic for this might be that if subdata (e.g. a list item) can be mutated on its own, it might warrant having its own view.

In code, views are instances of classes that extend EventEmitter and emit `update` events containing data.

When implementing views, try using the view templates provided in `templates.js` as they cover almost all use cases.

### The Data Store
The data store is a big in-memory database of all session data such as login state, caches, and other things. This is usually where data views might get their data from.

As a hierarchical data store (it’s literally a Javascript object) data should be stored in scopes such as `login`, `codeholders`, and so on. Such scopes can also be subscribed to (`subscribe`/`unsubscribe`) such that every time they change, a callback is called.

This is not an IndexedDB since the AKSO admin frontend doesn’t really seem to have much need for a persistent data store.

### Memory Management
If you have never used C here’s a small introduction: when you create yourself an object, at some point you’re never going to use it anymore. At that point it’s a waste of memory keeping it around, so in Javascript, the runtime tries to eventually find out about this and remove it.

However, most core objects register themselves for things like subscribing to a data store scope, in which case the data store now has a reference to the object and the runtime will never be able to conclude that this object is unneeded, even if it really is. (Note: I tried solving this with WeakMap/WeakSet but it didn’t really work out)

Hence, most core objects (even on the frontend side!) employ manual memory management because they need to know when they are never going to be used again, and then perform clean-up tasks like unsubscribing from events or deleting their proxied object. And so all such objects have a `drop` method that must be called at an appropriate time in lieu of creating a memory leak. You’ll just have to remember to call `drop` every time you’re done with an object (e.g. in `componentWillUnmount`).

Here is a list of common programming errors in C that are also applicable here:

- dangling pointer: doing stuff with an object that has been dropped might cause an error
- double free: calling `drop` twice might cause an error

## Frontend
The frontend uses Preact, and rarely, vanilla DOM APIs. At the root level (see `fe/index.js`) there are only `features/login` (obvious purpose), `app.js` (contains everything pertaining to a single AKSO session), the core interface (see `core/`) and task views (see below).

### Design
Because the AKSO admin frontend has been mandated to use Google’s Material Design, one should make their best effort to follow the spirit of the guidelines.

AKSO has basically only one accent color in two different shades (defined in `prelude.less` as `@primary` and `@secondary`) and currently their use seems a bit arbitrary.

#### Specific Notes
- refer to the material.io spec sheet
- use nice animations if possible
- use a nice GUI representation instead of just the API if possible
- no `cursor: pointer` for button controls! pointers are for hyperlinks

### Navigation
App navigation is strictly hierarchical, defined in `features/pages/index.js`. At the top level are several fixed paths (e.g. Home, Members, etc.) denoting sections of the app. In those views, a hamburger icon will be displayed in the app bar if applicable.

Additionally, there is a global stack of pages, which will be displayed as an actual card stack on big screens, or as regular full-screen pages on small screens. Items higher in the stack are deeper in the navigation hierarchy.

Each top-level path may have multiple subpaths, which may either be strings as before or regular expressions matching one path fragment. These views will always show a back button or close button instead of a hamburger icon, if applicable.

There are several types of these subpaths:

- `bottom` (stack bottom) will display a view as if it were a top-level page (admittedly the terminology gets a bit confusing here)
- `stack` views will be added to the stack
- `state` paths will not create any views but instead modify the state of the item below them in the stack (e.g. edit mode)

#### Query Strings and URL Encoding
Additionally, views may store state in a query string. If the view is below another in the page stack, then only the topmost view’s query string will be visible in the URL, but *all* views will have their state preserved in the `window.history` API’s state object. Views may also store additional arbitrary data in this state object, such as scroll position.

If a URL exceeds encodable lengths (i.e. ≈2000 characters) the query string will be replaced with `?T` (“truncated”) and indicate that the page state must be loaded from the history API. If there is no such state, we pretend it never existed.

#### Link Navigation
In-app links should always use the router context instead of HTML anchors to allow for proper handling of navigation. Router context navigation will cause the current state to be saved, the new page to be loaded, and the linked URL to be decoded, and most importantly, will not cause a page load, thus preserving cached data.

### Pages
Many AKSO pages follow a very similar design:

- an overview page (type `bottom`), which contains a searchable list view (see below)
    + a detail page (type `stack`) within, linked to by the overview list items
        * an “editing” state thereof (type `state`)
        * other miscellaneous sub-pages of the detail view
    + other miscellaneous sub-pages of the overview

This overview page will usually be a top-level path (e.g. `/membroj`). A detail page will simply add an ID to the path (e.g. `/membroj/36`). Detail page URLs should not use mutable identifiers (such as names, UEA codes, etc.) to identify an item.

Usually, the file structure is as follows:

- `index.js` (overview page)
- `detail.js` (detail page)
- `fields.js` (field renderers)
- `filters.js` (filters in the overview page)

#### Fields
Fields are specified in a big object and identified by their name.
Common properties of a field include:

- `component`: the React component that renders or edits the field. Is often passed following props:
    - `value`: value of the field
    - `item`: the whole object that this is a field of
    - `editing`: if true, the item is being edited
    - `onChange`: callback to update the value when editing
    - `onItemChange`: callback to update the whole object when editing
- `stringify`: like `component`, but used for CSV export. See code for function argument order
- `validate`: same props as `component`. Should return an error if validation fails. Otherwise, it should return something falsy.
- `isEmpty`: if this function returns true, this field will be grayed out and sorted to the bottom in detail views
- `shouldHide`: if this function returns true, this field will be hidden in detail views

### Searchable List Views
AKSO contains a lot of searchable lists. In the interest of DRY, these have been abstracted to the One True List View:

- at the top there is a search bar, where users *may* also pick a field to search
- below is a list of filters *or* a JSON filter editor
- below are some statistics about how long the request took and so on
- finally, the list items
- and at the bottom, a pagination control
- usually, list items will link to a detail view dedicated to that one item
- users may also pick visible fields using a field picker dialog
- there is also an option to export to csv somewhere

The search & filters control generally always follows the same format (see e.g. codeholders/list). The list of items will always be fetched using a task and not a data view, as all lists are volatile at least to some degree (see log view in administration for an extreme example). Each list item is however a data view, as that data will be fetched anew anyway.

Data is rendered using data renderers (see `components/data`), *including CSV output*.

On large screens, the results will usually be presented as a table, while on smaller screens they are presented as a list of lists of properties.

### Task Views
Tasks views are a special kind of component that are indexed in `fe/index.js` and are made to mirror tasks in the core, essentially providing users with an interface to modify task parameters and see the results. Task views will exist for as long as the task exists (plus some animation buffer time) and are usually dialogs. For example, a “crop profile picture” task would be accompanied by a dialog showing the crop interface and allowing for adjustment of the position and scale of the picture before running (and dropping) the task.

## Implementation Details
### Springs and the Global Animator
Almost all JS-driven animation is performed by springs and the global animator (yamdl).
To use springs, simply call `globalAnimator.register(this)`, make sure to have an instance method `update(deltaTime)`, and call `globalAnimator.deregister(this)` when done (especially in `componentWillUnmount`).
In `update(dt)`, call `spring.update(dt)` to update the spring, and `spring.wantsUpdate()` to check if the animation can be stopped.

### Portal Containers
Many dialog-like views in `components` have associated `portalContainer` variables, which, in essence, contain the dialog container div. These exist because preact glitches weirdly if you have a portal inside another portal in the same container ([preact issue](https://github.com/preactjs/preact/issues/2613)).

Feel free to remove these if that bug is ever fixed.

### Useful Components
#### Data Fields
There should probably be more of these (refactor!). Located in `components/data`. These are renderers and editors for various kinds of data.

#### DynamicHeightDiv
This component will dynamically animate its height when its children change, with a few caveats (see docs for details).

#### RearrangingList
This component will animate a list of same-height elements, and allow the user to drag-and-drop to reorder them.

#### OverviewList
Renders an overview list.

##### StaticOverviewList
A simplified version of OverviewList that manages its own state, intended for picker dialogs.

##### OverviewListItem
This component will render a core data view.

#### Form
A submittable form. Provides a React context for custom validation. Will refuse to submit if anything that was registered in the form context returns a validation error.

##### Field
Provides layout and optionally validation.

##### ValidatedTextField
Special-case validator for text fields.

#### Segmented, Select
Various kinds of selection fields.
