# AKSO Bus Problem Prevention Initiative
The AKSO admin frontend consists of two parts: the core (`core/`) and the web frontend (`fe/`).

## The Core
The application core is a web worker that handles almost all communication with the backend API.
It serves as an abstraction layer.
Since it’s a web worker, it’s also easy to log out and delete all data.
It consists of:

- a data store (cache). Data loaded from the AKSO API is stored here
- tasks. These are async functions that can be called from the frontend
- views. These are views of cached data that will be updated whenever it changes

Tasks and views are accessible from the frontend by paths like `login/hasPassword`.
The corresponding function definition is found in the `core/paths/login` file.
The first part is a namespace and the second is the task or view name.

In the frontend, these are both accessible through the core context (found in `fe/core`),
which is a React context for creating tasks and views in the web worker.

Because Javascript, core objects must be memory-managed manually.
Whenever an object is no longer needed, make sure to call drop() to notify the web worker as well.

### Tasks
Tasks are very broad in their scope and are basically any kind of function call or request.
Tasks have a very specific lifecycle:

1. A task is created with a set of immutable `options` and a set of mutable `parameters`
    - options usually contain object IDs and the like
    - parameters are the exact details of the action.
      for example, when changing the name of an object, the name would be a parameter.
2. Parameters may be updated at this stage (e.g. by a task view, see below)
3. The task is run
    - if it succeeds, it will return a result to the caller and drop itself
    - if it fails, it will return to step 2

Common tasks include CRUD actions and things that interface with API representations of data.
Tasks also often update data in the data store so that it can be observed by views.

When implementing tasks, try using the task templates provided in `templates.js` as they cover almost all use cases.

### Views
Views observe data in the core.
This is often a particular object. For example, the view `codeholders/codeholder`
with the options `{ id: 50, fields: ['name'] }` would observe the data for that particular codeholder.

A lot of views (such as `codeholders/codeholder`) will also automatically load data from the AKSO API.
This can often be configured using `noFetch` (don’t fetch data)
or sometimes `lazyFetch` (given `fields`, fetch only if fields are missing).

In code, views are instances of classes that extend EventEmitter and emit `update` events containing data.

When implementing views, try using the view templates provided in `templates.js` as they cover almost all use cases.

### The Data Store
The data store is a big in-memory database of all session data such as login state,
caches, and other things.
This is where data views get their data from.

As a hierarchical data store (it’s literally a Javascript object) data should be stored in scopes
such as `login`, `codeholders`, and so on.
Such scopes can also be subscribed to (`subscribe`/`unsubscribe`) such that every time they change, a callback is called.
If there are no subscribers in a particular scope, it will eventually be deleted by the garbage collector.

This is not an IndexedDB since the AKSO admin frontend doesn’t really seem to have much need for a persistent data store.

The structure is typically something like:

- `things`
    - (thing id)
        - thing fields (usually always accessed as an entire object)

### Conventions
In general, a namespace has tasks such as:

- `getThing`/`thing`: gets an object from the API. If successful, stores it in the data store.
- `createThing`: creates a new object. Sends a POST request and, if successful, stores it in the data store.
- `updateThing`: updates an object with new values. Sends a PATCH request and, if successful, stores it in the data store.
- `deleteThing`: deletes an object. Sends a DELETE request and, if successful, deletes it from the data store.
- `listThings`: gets a list of objects from the API.
  This will store each item in the data store and then return a list of IDs.
  The frontend can then create a view for each ID to observe that particular object.

There are, roughly speaking, two types of objects: complex objects with fields and simple objects without fields.

Simple objects are treated atomically and all CRUD actions have all or most fields of the object hardcoded.
Often, the API representation is also the same as the client representation.

Complex objects (e.g. codeholders) have field handling.
It’s possible to load only the fields needed for the current task (using a `fields` option/param)
and it will be *merged* into the data already loaded in the data store.
Fields not loaded will have the value `undefined`.
Additionally, fields may have a different representation on the client than in the API.
For example, the codeholder `name` field unifies all API name fields (`firstNameLegal`, `firstName`, etc.).
These field mappings are often defined in a `clientFields` object.

`list` tasks may also accept filters.
Filters with GUI editors always have a custom client-side representation, and these will be
transformed into API filters (often defined in a `clientFilters` object).

## Frontend
The frontend uses Preact, and rarely, vanilla DOM APIs.
At the top level:

- `index`: initializes the application
    - handles task views when not logged in
- `features/login`: login screen
- `app`: the application when logged in
    - handles task views not logged in
- `core`: connection to the core web worker

### Navigation
App navigation is strictly hierarchical, defined in `features/pages/index.js`.
At the top level are several fixed paths (e.g. Home, Members, etc.) denoting sections of the app.
In those views, a hamburger icon will be displayed in the app bar if applicable.

Additionally, there is a global stack of pages, which will be displayed as an actual card stack on big screens,
or as regular full-screen pages on small screens.
Items higher in the stack are deeper in the navigation hierarchy.

Each top-level path may have multiple subpaths, which may either be strings as before or regular expressions matching one path fragment.
These views will always show a back button or close button instead of a hamburger icon, if applicable.

There are several types of these subpaths:

- `bottom` (stack bottom) will display a view as if it were a top-level page (admittedly the terminology gets a bit confusing here)
- `stack` views will be added to the stack
- `state` paths will not create any views but instead modify the state of the item below them in the stack (e.g. edit mode)

#### Query Strings and URL Encoding
Additionally, views may store state in a query string.
If the view is below another in the page stack,
then only the topmost view’s query string will be visible in the URL, but *all* views will have their state preserved in the `window.history` API’s state object.
Views may also store additional arbitrary data in this state object, such as scroll position.

If a URL exceeds encodable lengths (i.e. ≈2000 characters) the query string will be replaced with `?T` (“truncated”)
and indicate that the page state must be loaded from the history API.
If there is no such state, we pretend it never existed.

#### Link Navigation
In-app links should always use the router context instead of HTML anchors to allow for proper handling of navigation. Router context navigation will cause the current state to be saved, the new page to be loaded, and the linked URL to be decoded, and most importantly, will not cause a page load, thus preserving cached data.

### Pages
Many AKSO pages follow a very similar design:

- an overview page (type `bottom` or sometimes `stack`), which contains a searchable list view (see below)
    + a detail page (type `stack`) within, linked to by the overview list items
        * an “editing” state thereof (type `state`)
        * other miscellaneous sub-pages of the detail view
    + other miscellaneous sub-pages of the overview

This overview page will usually be a top-level path (e.g. `/membroj`). A detail page will simply add an ID to the path (e.g. `/membroj/36`). Detail page URLs should not use mutable identifiers (such as names, UEA codes, etc.) to identify an item.

Typically, the file structure is as follows:

- `index.js` (overview page)
    - use the `OverviewPage` (`components/detail/overview-page`) template
- `detail.js` (detail page)
    - use the `DetailPage` (`components/detail/detail-page`) template
- `fields.js` (field renderers)
    - just a big object of fields
- `filters.js` (filters in the overview page)
    - just a big object of filters

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

- the SearchFilters component (provided by OverviewPage)
    - at the top there is a search bar, where users *may* also pick a field to search
    - below is a list of filters *or* a JSON filter editor
- the OverviewList component
    - below are some statistics about how long the request took and so on
    - finally, the list items
    - and at the bottom, a pagination control
    - usually, list items will link to a detail view dedicated to that one item
- users may sometimes also pick visible fields using a field picker dialog
- there may also be an option to export to csv somewhere

The search & filters control generally always follows the same format (see e.g. codeholders/list).
The list of items will always be fetched using a task and not a data view, as all lists are volatile at least to some degree (see log view in administration for an extreme example).
Each list item is however a data view, as that data will be fetched anew anyway.

Data is rendered using data renderers (see `components/data`), *including CSV output*.

On large screens, the results will usually be presented as a table,
while on smaller screens they are presented as a list of lists of properties.

### Task Views
Tasks views are a special kind of component that are indexed in `fe/index.js` and are made to mirror tasks in the core,
essentially providing users with an interface to modify task parameters and see the results.
Task views will exist for as long as the task exists (plus some animation buffer time) and are usually dialogs.
For example, a “crop profile picture” task would be accompanied by a dialog showing the crop interface and allowing for adjustment of the position and scale of the picture before running (and dropping) the task.

## Implementation Details
### Springs and the Global Animator
Almost all JS-driven animation is performed by springs and the global animator (yamdl).
To use springs, simply call `globalAnimator.register(this)`, make sure to have an instance method `update(deltaTime)`, and call `globalAnimator.deregister(this)` when done (especially in `componentWillUnmount`).
In `update(dt)`, call `spring.update(dt)` to update the spring, and `spring.wantsUpdate()` to check if the animation can be stopped.

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
