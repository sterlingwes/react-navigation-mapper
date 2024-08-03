# react-navigation-mapper

So far, an experiment.

## AST API

There are two types available via this package to make working with Typescript's AST easier:

### AST Visitors

This classes provide a mechanism for grouping visitors by a specific concern and tracking module-level & program-level (global) state.

Concrete examples of these use cases include:

- `NavigationDetectorVisitor` which collects components which reference React Navigation's navigation prop in some way, and the navigate calls they make with it
- `NavigatorDetectorVisitor` which collects screens from navigator components and their module references

### AST Visitor Mixins

Some concerns will span across different types of mixins, like being able to track which module something was found in. These capabilities can be mixed into AST Visitors.

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

Big todos

- track aliasing of createNativeStack primitive (wrapper calls and the newer builder pattern)
- ignore components defined within a primary component's scope (module-scope-level)
