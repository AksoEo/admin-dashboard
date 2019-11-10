# AKSO Bus Problem Prevention Initiative
The AKSO admin frontend consists of two parts: the core (`core/`) and the web frontend (`fe/`). To use MVC as an analogy, the core is the model (and controller) and the frontend is the view (and controller).

## The Core
The application core communicates with the frontend via IPC (or, in web terminology, “Web Worker API”) and mainly deals with two abstract components: tasks and data views. Tasks represent failable actions that have multiple inputs and one output, and data views simply allow a live view of some data.

Both tasks and data views are identified by a path such as `login/hasPassword` (which might check if a user has a password). Path scopes may be lazy-loaded (see `src/core/paths/index.js`).

### Tasks
Tasks have a very specific lifecycle:

1. they are created with a set of immutable `options` and a set of mutable `parameters`
2. `parameters` may be updated at this stage
3. the task is run
    - if it succeeds, it will return the result and drop itself (dropping: see memory management)
    - if it fails, it will return to step 2

In code, tasks are simply async functions that will be called by *the system* with the given options and parameters. The immutable options/mutable parameters distinction exists to facilitate semantics for task views (see frontend).

Unknown options or parameters will be ignored (this can be used e.g. to pass user data to task views).

### Views
Views act like React props in that they are simply observed data that might change over time and can’t be mutated directly (to mutate the data, one would use a task).

In general, views should be kept lean and shouldn’t be responsible for too much data—for example, a list of some complex data would use one view with the list item identifiers and the properties of the list items would be read from several other views, one for each item. A decent heuristic for this might be that if subdata (e.g. a list item) can be mutated on its own, it might warrant having its own view.

In code, views are instances of classes that extend EventEmitter and emit `update` events containing data.

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

#### Opinions
I (@cpsdqs) have opinions:

- please do refer to the material.io spec sheet animations
- please don’t replace proper animations with half-hearted fading (e.g. see material web components)
- please don’t use `cursor: pointer` for button controls, it should be reserved for hyperlinks
- please do at least try not to just make everything a 1:1 representation of the underlying data structures if it could be better

### Task Views
Tasks views are a special kind of component that are indexed in `fe/index.js` and are made to mirror tasks in the core, essentially providing users with an interface to modify task parameters and see the results. Task views will exist for as long as the task exists (plus some animation buffer time) and are usually dialogs. For example, a “crop profile picture” task would be accompanied by a dialog showing the crop interface and allowing for adjustment of the position and scale of the picture before running (and dropping) the task.
