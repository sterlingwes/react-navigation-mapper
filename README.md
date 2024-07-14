# react-navigation-mapper

So far, an experiment.

## Contributing

Best way to get a sense of the AST is to do a combination of:

- reference https://astexplorer.net/ with your sample module of choice; and
- run bun in debug mode

### Running Bun in Debug Mode

For example if you wanted to debug a test suite you could:

- add a breakpoint by clicking next to the line number where you want to stop
- run `bun --inspect-wait='localhost:6499/bunbun' test packages/ast`
- run "Attach to Bun" from the "run & debug" pane (or hit F5)

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
