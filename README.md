# react-navigation-mapper

So far, an experiment.

## Todos

- [ ] keep user components so we can render the whole tree
- [ ] keep all conditionals that lead to rendered components
- [ ] hoist / statically link all conditionals so they can be enumerated
- [ ] figure out how to deal with things like `useUserAuthenticated` that wrap a condition used to render screen paths

--

New approach?

- two typescript approaches:
  - build the module graph to see which module depends on (imports) others
  - parse individual modules to locate components & navigation calls
- we want to be able to:
  - draw a hierarchy of screens / components in our app at a high level
  - draw navigation relationships between screens based on navigate() calls & deeplink paths
  - given a changeset or diff, derive affected screens (based on touched files?)
- for this we'd need:
  - a lookup for components by name in form of `file#ComponentName` with any metadata we want to track
    - isScreen (based on whether registered as such in a react-navigation component)
    - screen options (modal presentation, etc.)
    - owner file path
  - a lookup for modules keyed by project file path ("owner file path" in component lookup)
    - array of imports the module has
    - array of dependent modules (modules which import this one)
    - array of exported identifiers
      - name
      - type
      - component ID if component
  - a way to render a hierarchy of screens with relationship arrows ([basic flowchart?](https://mermaid.js.org/syntax/flowchart.html))
  - a way to derive affected screens from a list of changed files
