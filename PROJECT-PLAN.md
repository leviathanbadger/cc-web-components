# Project Plan for CC Web Components

## Project Overview and Goals

The CC Web Components project aims to recreate and extend some of the intuitive UI controls found in
Adobe Creative Cloud applications, as reusable web components running in the browser via WebAssembly
(WASM) and Rust. In Adobe CC, many controls allow fluid, interactive adjustments that traditional HTML
inputs don’t easily support. For example, instead of typing numbers into a text field repeatedly,
Adobe UIs often let the user drag left/right on a numeric value to continuously adjust it and see
live feedback. The README’s first screenshot (a Continuous Number Input example) demonstrates this
drag-to-change behavior, where the user can click and drag on a value (e.g. a layer property) to
smoothly vary it, without manually retyping numbers for each change. The second screenshot (a Text
Number Input example) shows that a conventional textbox input is still available for precise entry,
but the drag interface is far more intuitive for exploring values in a visual design context. This
simple example illustrates the kind of enhanced control the library will provide: a more natural,
interactive number input that avoids the tedious workflow of constant manual edits.

Overall, the project’s goal is to build a library of custom UI components (e.g. draggable numeric
inputs, and potentially others inspired by Adobe’s tool palette) that developers can drop into any
web application. These components will be implemented in Rust and compiled to WebAssembly for high
performance, and they will be exposed as native browser elements (using the Web Components standard)
so that they can be used with any framework or plain HTML. By leveraging the Shadow DOM for each
component, the implementation details can remain encapsulated, making the components easy to reuse
without fear of CSS/JS conflicts on the page. The project is also a personal learning endeavor for
modern web technologies: the author intends to explore Rust/WASM, the Shadow DOM, the Pointer
Events API (for mouse/touch interactions), Pointer Lock (for capturing the cursor during drag
operations), and even the Houdini CSS API for custom styling effects. Finally, the project is an
experiment in using AI coding tools (OpenAI’s Codex) to automate parts of the development, hence
the “Experimenting with Codex” remark in the README. In summary, CC Web Components will blend
cutting-edge web platform features with Rust’s performance, aiming to deliver novel UI controls
that improve user experience in web applications similar to how Adobe’s UIs do.

## Key Technologies and Tools

To achieve these goals, the project relies on several key technologies. Below is an overview of
each, along with how they relate to this component library:

### Custom Elements (Web Components)

Custom Elements are a core part of the Web Components standard, allowing developers to define new
HTML tags with custom behavior. A custom element is essentially a JavaScript class that extends HTMLElement (often via a base class). In our case we will use Lit's `LitElement`, and register the element with the browser's custom elements registry. Once defined, you can use a `<custom-tag>` in any page, and the browser will instantiate your class for that element, enabling fully custom logic and rendering.
In this project, each UI
control (e.g. a draggable number input) will be implemented as a custom element, so it can be
embedded in any web page just like `<div>` or `<input>` tags. Web components have the benefit of
interoperability – they work with any framework or no framework at all, because they are standard
browser features. This makes them ideal for a shared component library. We will define our
custom elements using Lit's `LitElement` base class and specify a tag name, such as `<cc-draggable-number>` for the
continuous number input control. Key capabilities of custom elements that we’ll use include
lifecycle callbacks (to initialize the component when it’s added to the DOM) and custom events
(to notify the host application of changes, e.g. when the value changes due to dragging).

### Shadow DOM

Web Components also introduce the Shadow DOM as a mechanism for encapsulation. Shadow DOM allows
our custom element to attach a hidden, internal DOM tree that is isolated from the main document’s
DOM. This means styles and scripts in the main page won’t accidentally affect the internals of
our component, and vice versa. By using shadow DOM in each CC web component, we ensure that the
HTML structure, CSS styles, and implementation details of the component remain self-contained.
For example, the draggable number input might consist of an internal `<input type="text">` and
some special arrows or overlay for dragging; all of that can live inside the shadow root of
`<cc-draggable-number>`. External pages cannot directly see or modify this internal DOM (unless
the shadow DOM is opened for inspection), which makes the component safe to use in any context
without CSS conflicts. We will apply scoped styles inside the shadow DOM so that the component
looks and functions as intended regardless of the surrounding page’s styles. Shadow DOM also
helps prevent outside scripts from accidentally interfering with the component’s behavior.
Overall, this encapsulation will keep usage simple for developers – just drop in the custom tag
and it works, as the README puts it.

### Lit Library

Lit is a lightweight library for building web components that can greatly simplify our development
process. Lit provides a base class (LitElement) that includes a reactive state system, a declarative
templating engine (using lit-html), and helpers for managing attributes and properties, all on
top of the standard Web Components APIs. In essence, Lit removes a lot of boilerplate that
vanilla custom elements require, and it makes it easy to define a component’s template in a
concise way. Each Lit element is still a true custom element under the hood (so it works
anywhere), but Lit’s ergonomics (like its template literal HTML syntax and reactive properties)
will help us build complex components faster. For this project, using Lit will be very beneficial, and we have committed to it,
since our components might need to render dynamic content and update the UI in response to user
interactions (for example, updating the displayed number while dragging). With Lit, we can define
the component’s HTML structure in the `render()` method and let Lit handle re-rendering when
properties change, rather than manually manipulating the DOM. Lit also supports scoped CSS
by letting us define styles that apply inside the shadow DOM of the component. Given that
performance is a goal, it's worth noting that Lit is designed to be fast and lightweight, adding minimal overhead. We have decided to use Lit for this project to prioritize productivity and maintainability. Lit provides a modern, efficient way to create Web Components with reactive state and templating, which aligns with our needs for building a polished component library.

### Rust and WebAssembly

A distinguishing aspect of CC Web Components is that component logic will be written in Rust,
compiled to WebAssembly. Rust offers memory safety and high performance, which can be advantageous
for computationally heavy or performance-sensitive UI logic. In this context, Rust could be used to
implement complex math or state logic for our controls, or simply as an opportunity for the developer
to apply Rust skills to front-end development. WebAssembly (WASM) allows us to run the compiled Rust
code in the browser. To integrate Rust-generated WebAssembly with JavaScript and the DOM, we will
use tools from the Rust WASM ecosystem, especially wasm-bindgen. The wasm-bindgen library and CLI
facilitate high-level interactions between Rust and JavaScript—allowing Rust code to call Web APIs
(like document, window, or custom events) and letting JavaScript call into exported Rust functions.
In practice, we might create Rust functions for things like processing input values or performing
continuous updates, and expose them to JS. For example, when a user drags the number input, the
component’s JS could call a Rust function that applies some formula or smoothing to the value.
The Rust code can in turn use web-sys (the Rust bindings for Web APIs) to manipulate the DOM or
dispatch events if needed. One of the goals is to have these components "run in the browser" at
native speed, and Rust/WASM is how we achieve that. It’s worth noting that using Rust in a web
project introduces some complexity: we’ll need to manage a build process to compile the Rust
code to a .wasm binary, and then load that module in the web app. We will address build/tooling
considerations later (using tools like wasm-pack and Vite’s capabilities). The payoff is that
performance-critical parts of the component can be optimized in Rust, and we get to leverage
Rust’s strong compile-time checks and rich type system for those parts of the code. In summary,
Rust and WebAssembly will power the internals of these components, providing speed and efficiency,
while the outer interface remains a standard web component that any app can use.

### Pointer Events and Pointer Lock

Because one of the primary example features is clicking and dragging with the mouse (or touch)
to adjust values, the project will make heavy use of the Pointer Events API. Pointer events are
a modern way to handle input from mouse, touch, and pen in a unified manner. They offer more
granular control than older mouse/touch events, including the ability to track pointer movements,
pressure, and so on. Using pointer events will allow our components to respond to drag gestures
smoothly. For instance, the draggable number input will listen for pointerdown on the value
display, then capture pointermove events as the user drags, updating the value continuously.
We might also use Pointer Lock in scenarios where dragging needs to continue even if the cursor
reaches the edge of the screen. Pointer Lock is a browser API that lets an element capture the
pointer, so the cursor can move indefinitely (often hiding the actual cursor and reporting relative
motion). This is useful for controls where you want potentially unbounded dragging (e.g., scrubbing
a value without running out of screen real estate). In an Adobe app, for example, you can drag
horizontally infinitely to keep changing a value. Implementing that on the web might involve
calling `element.requestPointerLock()` when a drag starts, so we keep receiving movement
deltas even if the cursor technically leaves the element or screen. We will have to carefully
manage this (requesting lock on user action and releasing on mouse up or Escape key). Both
Pointer Events and Pointer Lock are well-supported in modern browsers, but we will need to
ensure we use them correctly (e.g., Pointer Lock requires a user gesture to initiate). By
mastering these APIs, our components will achieve the same kind of smooth, interactive feel
as their desktop counterparts. This aligns with the project’s goal of modern, intuitive UI
interactions beyond the standard HTML controls.

### Houdini CSS API

Another advanced technology mentioned in the README is the Houdini CSS API (specifically the
CSS Paint API and possibly others). Houdini is a collection of low-level APIs that give developers
more control over CSS rendering. For example, the CSS Painting API allows developers to write
a custom paint worklet – essentially a tiny rendering function in JS (or WASM) that can draw
graphics which can be used in CSS (like as a background image, border, mask, etc.). In the context
of CC Web Components, Houdini could be used to create special visual effects for our controls.
Imagine a custom slider track or a patterned background that reacts to the component’s state;
a Paint API worklet could draw that on-the-fly. Another part of Houdini is the Typed CSS OM
and Properties & Values API, which allow defining new CSS custom properties with specific
types and even custom layout or animation behaviors. This is quite experimental, but the
README suggests the author might explore creating custom CSS properties/animations for the
components. For instance, a component might expose a CSS property (e.g. --cc-slider-highlight-color)
that influences its rendering, and a Houdini paint worklet could use that property to draw
a highlight. The main thing to note is that Houdini APIs are still not supported in all
browsers equally (Chrome has the most support, with others lagging). That means if we do use
Houdini, we should feature-detect and provide fallbacks so that the components still work
(perhaps with a less fancy appearance) on browsers that don’t support those APIs. Overall,
Houdini could add some cutting-edge visuals or performance optimizations to our library,
but it will likely be an optional enhancement. Our project plan should treat Houdini
features as progressive enhancement: great if available, but not core to the functionality.

### Development Tooling (Bundler, Dev Server, etc.)

To build and test this component library effectively, we will use modern development tools:

  - Vite: Vite will serve as our development server and build tool. Vite is a next-generation frontend
    build tool that provides a dev server with lightning-fast hot module replacement and uses native
    ES modules for bundling efficiency. During development, Vite will let us serve our component
    library and an example application to test the components, with near-instant updates when we
    change code. For production, Vite can bundle our library using Rollup under the hood,
    producing optimized builds. We will configure Vite in library mode so that it outputs our
    components as a library (likely in both ESM and UMD formats by default). Vite’s strength is
    that it’s minimal configuration and very fast, which suits our needs—especially since we might
    be compiling Rust to WASM as well. Notably, Vite has built-in support for handling .wasm files:
    we can import a WebAssembly module with a special query (e.g.
    `import init from './my_component.wasm?init'`) to initialize it, and Vite will ensure the WASM
    is properly served and inlined or copied to the bundle. We may also use a plugin like
    vite-plugin-wasm to streamline integration with wasm-pack outputs, which is designed to handle
    Rust-generated WASM modules. Overall, Vite will significantly ease the development process with
    its fast reloads and simple configuration for building our library.

  - Testing Framework: For testing, we can use Vitest, which is a Vite-native testing framework.
    Vitest is designed to reuse Vite’s configuration and pipeline, making it seamless to test our
    components in a similar environment to how they run in the browser. It supports running tests in
    a Node environment with jsdom to simulate the DOM, and even has an option to run tests in a real
    browser if needed. Using Vitest will allow us to write unit tests for component logic (both the
    JS/TypeScript part and potentially verifying Rust-WASM interactions via JavaScript). It’s
    compatible with standard testing libraries, so we can use utilities like @testing-library/dom
    or open-wc’s testing helpers for web components. The key benefit is speed and simplicity –
    Vitest runs tests blazing fast and supports modern syntax out of the box. We’ll configure Vitest
    to work with our project (which should be minimal effort if we scaffold with Vite). In addition
    to unit tests, we might consider some end-to-end style tests for the interactive behavior (for
    example, using Playwright or Puppeteer to simulate a user dragging the component and verifying
    the outcome), but initially Vitest should suffice for logic and rendering tests.

  - Linting and Formatting: We will maintain code quality and consistency by using ESLint and
    Prettier. ESLint can be set up with recommended rules for TypeScript (if we use TS) or JS, and
    with specific plugins for Lit or Web Components to catch common issues (for example, ensuring
    that all custom elements are defined before use, or that attributes/properties are handled
    correctly). Prettier will be used to auto-format code, ensuring a consistent style (e.g., quotes,
    spacing) across contributions. For the Rust side of the code, we will rely on rustfmt (Rust’s
    built-in formatter) and perhaps clippy (the Rust linter) to ensure the Rust code is idiomatic
    and free of common mistakes. We can integrate these tools into our build or CI pipeline so
    that issues are caught early. Having linters and formatters is especially helpful in a project
    that mixes technologies, to keep the code clean and unified.

  - Continuous Integration & Publishing: We plan to use GitHub Actions as our CI/CD pipeline
    solution. This will let us automate building the project, running tests, and even publishing
    the library to NPM. In CI, we will set up a workflow that on each push (and pull request) runs
    through the steps of installing dependencies, building the Rust code to WASM, running the JS
    build with Vite, and executing all tests. This ensures that each change doesn’t break anything.
    For publishing, we can create an Action that triggers on a version tag (e.g., when we push a Git
    tag like v1.0.0), which then runs the build and publishes the package to the NPM registry. Using
    GH Actions will help catch integration issues between Rust and JS builds on a clean environment
    and will automate the release process so we consistently ship the library with all necessary
    files (including the .wasm assets). We’ll detail a sample GitHub Actions configuration in the
    Project Plan section below.

With the combination of these tools – Vite for development/build, Vitest for testing,
ESLint/Prettier for code quality, and GitHub Actions for automation – the project will have a robust
workflow to support development and distribution of the component library.

## Potential Challenges and Mitigations

Building a library that spans Rust and Web technologies comes with several challenges. Below is a
list of some technical or architectural pain points we anticipate, along with proposed solutions or
best practices to address them:

  - Rust/WASM Build Integration: Coordinating the Rust build (to produce WebAssembly) with the
    front-end build can be tricky. If not automated, developers might have to manually recompile
    the Rust code whenever it changes. Mitigation: Use a tool like wasm-pack to compile Rust
    into a ready-to-use NPM package, or a Vite plugin to trigger Rust compilation. We can add a
    step in the Vite dev server that watches for changes in the Rust src and rebuilds the WASM.
    Another approach is to include the wasm-bindgen output as part of the npm build script.
    By scripting this or using a plugin, we ensure that whenever npm run build or npm run dev is
    executed, the latest Rust code is compiled to my_component.wasm and included. Vite’s
    documentation notes that WebAssembly ES module integration isn’t native yet, but using the
    `?init` import or community plugins is the way to go. We will follow those recommendations
    so that the Rust side seamlessly integrates with the JS bundler.

  - Passing Data Between JS and WASM: Communication overhead between JavaScript and WebAssembly
    can be a concern, especially if we call into WASM on every animation frame or pointer move.
    Unoptimized calls could become a bottleneck. Mitigation: Design the interface between JS and
    Rust carefully. For example, if continuous pointer moves are sending many events, consider
    debouncing or processing them in Rust entirely. We can have the Rust code maintain state
    and only send needed updates to JS (or vice versa). Also, using simple data types (numbers,
    arrays) that map directly to WASM memory will minimize overhead. In critical loops, prefer
    to keep logic on one side (all-JS or all-Rust) rather than bouncing back and forth each
    frame. Fortunately, modern JS engines and WASM are pretty fast at calling each other, but
    we will profile if performance issues arise and adjust (e.g., batch updates, or move more
    logic into Rust to avoid excessive calls).

  - Bundle Size and Distribution: Including a WebAssembly binary and the supporting JS could
    inflate our package size. Also, ensuring the .wasm file is correctly published to NPM and
    loaded by consumers is a point of complexity. Mitigation: Use release-mode optimizations
    for Rust (and enable wasm-opt if possible) to keep the WASM binary small. WebAssembly can
    be very compact, but debug info can bloat it, so we will produce minified WASM for releases.
    For distribution, since we’ll use Vite’s library build, we might let Vite handle inlining
    small WASM files or copying them. Vite will inline .wasm below a certain size into the
    bundle (base64 encoded) or otherwise treat it as an asset and automatically fetch it at
    runtime. We’ll test the consumer experience: ideally, a user installing our NPM package
    can just import the component, and behind the scenes the JS will fetch or instantiate
    the WASM. We’ll document if any extra steps are needed. Additionally, we should provide
    both ESM and UMD builds (which Vite can do) so that the library can be used in a
    `<script>` tag or in Node-based toolchains. Care will be taken to mark heavy dependencies
    as external if needed, and to tree-shake unused code, so apps only pay for what they use.

  - Development Environment Setup Complexity: Setting up a project with both a Node.js toolchain
    and Rust toolchain could be a barrier (developers need to install Rust, etc.). Mitigation:
    Clearly document the setup steps (as we will in this plan) and consider automating some
    checks. For example, our project’s README can note “Install Rust via rustup before running
    build.” In the GitHub Actions CI, we will use actions-rs/toolchain to ensure Rust is
    installed, and the Node environment for Vite, so that the build always has both available.
    We could also create a script that checks for Rust and prints a friendly message if not
    found. Using a monorepo structure (with perhaps a Yarn/NPM workspace and a Cargo project)
    will help isolate concerns but also means one repository to clone that has everything.
    As long as instructions are clear, this should be manageable.

  - Testing Web Components with Shadow DOM: Writing automated tests for shadow DOM elements
    can be a bit involved, because test code might need to pierce into the shadow DOM to query
    elements or verify rendering. Also, jsdom (used in many test runners) has partial support
    for shadow DOM and custom elements. Mitigation: Use a testing approach that leverages a
    real browser environment for critical tests if needed. For example, @web/test-runner with
    a headless browser could run our component tests in a real Chromium environment,
    fully supporting Shadow DOM. However, since we plan to use Vitest (which uses jsdom by
    default), we can still test a lot of logic by interacting with the component’s public API.
    We can, for instance, set properties and call methods on our custom element and assert that
    the visible outcome (text content or emitted events) is as expected. Vitest can be configured
    to use a custom environment like happy-dom which has better support for web components.
    Additionally, the open-wc testing helpers provide functions such as fixture() that can
    render a custom element and return its shadow root for inspection. We will incorporate those
    to inspect shadow DOM internals in our tests. In summary, testing will require a bit of
    boilerplate, but using the right tools and helpers will mitigate the difficulty.

  - Ensuring Cross-Browser Compatibility: Our use of modern APIs (Web Components, WASM, pointer
    events, etc.) means older browsers (like IE11 or old Edge) won’t support the library. This
    may not be a real “pain point” if we target evergreen browsers, but it’s worth acknowledging.
    Mitigation: Clearly state the supported browsers (likely the last two versions of Chrome,
    Firefox, Safari, and Edge). If necessary, include polyfills for Custom Elements and Shadow
    DOM (there are polyfill libraries for Web Components) for any environment that might lack
    them. However, since Web Components and WASM have been supported by all major evergreen
    browsers for a few years, we may decide not to bundle polyfills and instead note the
    requirements. For pointer events, virtually all modern browsers support them (and if not,
    we can fall back to mouse events). For Houdini, as noted, we will check for support before
    using those features. Our build (via Vite/Babel) can also down-level compile any JS features
    as needed based on a target browserslist, so that syntax isn’t an issue. In short, we’ll
    develop primarily for modern environments and document that, while providing fallbacks or
    graceful degradation where feasible.

  - CSS Encapsulation and Theming: Using Shadow DOM means by default, users of our components
    cannot style the internals (which is good for encapsulation but could be bad if they want to
    tweak the look). Mitigation: Design our components to be customizable through defined APIs.
    This could include CSS Custom Properties (which do pierce into shadow DOM styles if the shadow
    CSS uses them) for things like colors or sizing. Also, we can use the `::part` and `::theme`
    mechanisms: if we expose certain elements in our shadow DOM with the `part="..."` attribute,
    page authors can use the `::part()` selector to style them. For example, if `<cc-draggable-number>`
    has an internal `<span part="value">`, then an app’s CSS can do
    `cc-draggable-number::part(value) { /* styling */ }`. We should identify which aspects might
    need theming and expose those hooks. This balances encapsulation with flexibility.
    Additionally, we’ll document how to override styles or provide alternative themes (perhaps
    by swapping a CSS file or using attributes on the component to select styles).

  - Using AI (Codex) for Automation: Since the project mentions automation with Codex, one
    challenge might be that AI-generated code could be imperfect or require substantial adjustments.
    Mitigation: Treat AI suggestions as a starting point and always review and test them thoroughly.
    We should enforce code reviews (even if just by the solo developer) for any AI-written sections,
    to ensure they meet our performance and quality criteria. Over time, as the developer gains
    familiarity with the tech, the reliance on AI might decrease. It’s also important to not
    introduce security or performance issues through blindly accepted AI code. In CI, our tests
    and linters will catch many potential issues. In short, the plan here is to use Codex to speed
    up routine coding, but not to fully trust it without verification.

By anticipating these challenges and planning solutions, we can ensure the project runs smoothly
and the resulting component library is robust. Next, we’ll outline a step-by-step project plan
incorporating these technologies and best practices.

## Project Plan

In this section, we propose a detailed plan for structuring the repository, setting up the
development environment, creating examples, testing, documentation, and configuring CI/CD for
the cc-web-components project. The plan is intended to guide the initial development phase and
set up a sustainable structure for the project as it grows.

### Repository Structure

Organizing the repository clearly will make development easier. Below is a proposed initial structure:

```
cc-web-components/
├── package.json               # NPM package manifest (for the JS/TS part)
├── vite.config.ts             # Vite configuration, including library build settings
├── Cargo.toml                 # Rust crate manifest (for the Rust/WASM part)
├── src/                       # Source code for the web component library
│   ├── index.ts               # Main entry point that registers all custom elements
│   ├── components/           # Directory for individual component implementations
│   │   ├── draggable-number/
│   │   │   ├── index.ts      # JS/TS code for the <cc-draggable-number> component
│   │   │   ├── style.css     # Component-specific styles (if not in JS)
│   │   │   └── template.ts   # Template definition (Lit)
│   │   └── ... (other components) ...
│   └── wasm-bindings/        # Helper TS files to load/initialize WASM
│       └── cc_components_bg.wasm?    # (This will be generated or copied from Rust build)
├── rust/                      # (Optional) Rust source code directory if separated
│   └── src/
│       ├── lib.rs             # Rust source: component logic exposed via wasm-bindgen
│       └── ...               # Other Rust modules
├── examples/                  # Example projects or demo pages consuming the library
│   └── basic-demo/
│       ├── index.html        # A simple HTML file demonstrating usage of our components
│       └── main.ts           # Script to import the library and use it (if needed)
├── tests/                     # Integration tests (if any)
│   └── ...
├── readme-images/             # Images for the README documentation (screenshots, etc.)
└── .github/
    └── workflows/
        └── ci.yml            # GitHub Actions workflow for build/test (and possibly publish)
```

Rationale: This structure separates concerns clearly. The src/components/ directory can contain
one subfolder per web component, which is helpful as the project grows to multiple controls.
Within each component folder, we can have its specific code and styles. Using a subfolder per
component also allows grouping related tests or assets if needed (for instance, if a component
has a unique image or WASM file, though in our case the WASM might be common). We have a
top-level src/index.ts which serves as the library entry point – this file will import and
register all the components, and will be the file we point to for bundling in Vite’s config.

The Rust source is contained either in rust/src/ or directly in a Rust crate at the repo
root (with Cargo.toml). We might choose to put the Rust code in a subfolder like rust/ to
keep it distinct from the TS code; alternatively, the Rust project could live in the root
if we configure Cargo to output to pkg/ for wasm-pack. The key is that Cargo produces a .wasm
(and accompanying JS bindings) that ends up being used by our TS/JS code. One approach is
to run wasm-pack build --target web --out-dir src/wasm-bindings – this would compile the
Rust and place the generated cc_web_components.js and cc_web_components_bg.wasm into
src/wasm-bindings/, which our index.ts can then import. In the structure above, wasm-bindings
is intended for those build artifacts or any glue code needed to initialize the WASM module.

The examples/ directory will contain one or more example projects or pages. To start, a
basic-demo with an index.html is extremely useful – it can be opened in the dev server to
manually test the components in a realistic scenario. We could even set up Vite to serve
this during development (e.g., vite --open examples/basic-demo/index.html). This example
will also act as documentation by showing how to use the components (like including
`<cc-draggable-number>` in HTML and perhaps using it with some script).

Unit tests live next to the code they cover in `*.spec.ts` files. The `tests/` directory
is reserved for future integration tests. Unit specs verify behaviors such as value
synchronization or pointer dragging directly alongside the relevant component source.

Finally, .github/workflows/ci.yml will contain the CI pipeline configuration for GitHub Actions.

This structure is not set in stone – it can adapt – but it provides a starting point that
accommodates our multi-language setup (Rust + TS) and the need for both library code and
example usage.

### Development Setup Steps (Vite, Rust, etc.)

Setting up the development environment involves configuring Vite for both our library build
and for integrating Rust compilation, as well as installing other tooling:

1.  Node.js Project Initialization: We will initiate an npm project (npm init) to create
    package.json. This will manage our JavaScript/TypeScript dependencies (like Vite, Vitest,
    Lit, etc.). We set the package name to cc-web-components (so that it can be published
    under that name eventually). We will also add a `"type": "module"` in package.json if we
    want to use ES Module syntax in config files and such.

2.  Install Vite and Dev Dependencies: Run
    `npm install --save-dev vite vitest typescript eslint prettier` (and any related tooling).
    Install Lit with `npm install lit` as our components will rely on it. Vite will be our dev server and bundler.
    For TypeScript, we add a tsconfig.json that Vite/Vitest will use. We’ll configure
    tsconfig.json to output ESNext and module resolution NodeNext (for ESM). We also ensure
    types for Node and possibly jsdom for tests are included.

3.  Vite Configuration: Create vite.config.ts. In this config, we will set it up for library
    mode. For example:

    ```typescript
    import { defineConfig } from 'vite';
    import { resolve } from 'path';

    export const config = defineConfig({
        build: {
            lib: {
                entry: resolve(__dirname, 'src/index.ts'),
                name: 'CCWebComponents',
                formats: ['es', 'umd'],  // ESM and UMD build
                fileName: format => `cc-web-components.${format}.js`
            },
            rollupOptions: {
                // externalize deps like lit to reduce bundle size if desired
                external: ['lit'],
                output: {
                    globals: { lit: 'Lit' }
                }
            }
        }
    });

    export default config;
    ```

    This tells Vite we’re building a library from src/index.ts, and it should produce bundle
    files like cc-web-components.es.js and cc-web-components.umd.js in the dist folder. We mark
    lit as external so that it won't be baked into our library (assuming consumers will also include it, or we might reconsider and bundle Lit to make it zero-config for users – that's a choice to make). We may adjust formats (maybe CJS instead of UMD if needed). Vite will
    handle minification and such for production builds.

    Additionally, we need to integrate the Rust/WASM build. Since Vite doesn’t compile Rust, we have
    two main options:

      - Pre-build step: We can add an npm script like
        `"build:wasm": "wasm-pack build rust --target web --out-dir src/wasm-bindings"` which
        compiles the Rust crate and places the output in our src tree. Then make the main build
        depend on this. E.g., have `"build": "npm run build:wasm && vite build"`. For dev server,
        we might do something similar: run wasm-pack once and perhaps watch manually. In practice,
        running the Rust build on every file save might be slow, but we probably won’t be changing
        Rust code as frequently as TS code. We could leave it to the developer to run npm run
        build:wasm when Rust changes, or use a tool like cargo-watch to automatically recompile
        on file changes.

      - vite-plugin-wasm: There is a community plugin to integrate Rust WASM. We could try
        vite-plugin-wasm or specifically vite-plugin-wasm-pack. For instance, using
        vite-plugin-wasm-pack we could do:

        ```typescript
        import wasmPack from 'vite-plugin-wasm-pack';
        // ...

        export const config = defineConfig({
            plugins: [wasmPack('./rust')]  // path to our Rust crate
            // ... plus the build.lib config
        });

        // ...
        ```

        This plugin will automatically run wasm-pack and handle the resulting package as part
        of the Vite build. It makes the development server reload when the Rust code changes,
        etc. This would greatly streamline Rust integration. If such plugin is stable, we should
        use it. Otherwise, we go with the manual script approach.

    In either case, after building, our TypeScript code can import the WASM module. If using
    wasm-pack, it generates a JS file we can import, e.g.:

    ```typescript
    import init, { DraggableNumber } from './wasm-bindings/cc_web_components.js';
    // `DraggableNumber` could be a Rust-exported struct or function
    await init(); // initialize the WASM module
    ```

    Alternatively, if we manage the .wasm file ourselves, Vite allows direct import with ?init as
    noted. For example:

    ```typescript
    import initWasm from './wasm-bindings/cc_web_components_bg.wasm?init';
    const wasm = await initWasm();
    ```

    This returns an instance; we could then call functions on wasm.instance.exports. But using the
    bindgen JS glue (the init function from wasm-pack) is easier since it sets up exports nicely.
    We’ll document this in the code.

4.  Rust Toolchain Setup: Ensure the Rust toolchain is installed (rustup default stable etc.) and
    add the WASM target: `rustup target add wasm32-unknown-unknown`. In Cargo.toml, specify
    `crate-type = ["cdylib"]` to produce a C-compatible binary for WASM. Also, include dependencies
    like `wasm-bindgen = "..."`, `web-sys = "..."` with features for the APIs we need (e.g.,
    Window, Document, etc. as shown). We will write Rust code in lib.rs using `#[wasm_bindgen]` to
    expose functions or classes to JS. For example, we might have:

    ```rust
    #[wasm_bindgen]
    pub fn set_value(val: f64) {
        // ... some logic, perhaps store in static or return processed value
    }
    #[wasm_bindgen]
    pub fn process_drag(delta: f64) -> f64 {
        // process pointer movement delta and return a new value
    }
    ```

    We compile with wasm-pack build or similar as described. After a successful build, ensure the
    generated .wasm and JS are in place for the Vite side to use.

5.  TypeScript and Source Code: Develop the component classes in src/components using Lit:

      - Create a class DraggableNumber that extends LitElement. Use the
        `@customElement('cc-draggable-number')` decorator (or call customElements.define) to
        register it. Give it reactive properties like value (the current number). Implement the
        `render()` to display the number (and perhaps +/- buttons or drag handles if needed).
        Attach event listeners for pointer down/move (Lit allows standard DOM listeners in
        templates or manual in connectedCallback).

      - Either way, inside those event handlers, we might call our Rust functions. For instance,
        on pointermove, we calculate deltaX and call `process_drag(deltaX)` from WASM to get a
        new value, then update this.value. Or, we can keep the logic in JS for now (e.g. increment
        value by some sensitivity * deltaX). The Rust integration can be incremental—maybe
        initially, Rust just provides a function to clamp or format values, and later more
        complex things.

        - Use CSS to style the component. Define static styles in Lit or import a CSS module via Vite.

      - Ensure to handle both input modalities: dragging (continuous) and direct text input.
        For text input, a simple `<input type="number">` could be in the shadow DOM; on change or
        enter, update this.value. For dragging, use pointer events on maybe a wrapper or the number
        display itself. Perhaps change the cursor to a ew-resize on hover to indicate draggability.

6.  Example Project: Under examples/basic-demo, set up a minimal demo. The index.html can load
    the UMD bundle of our library (once built) or during dev, use a
    `<script type="module" src="/src/index.ts"></script>` to pull directly from our source via Vite.
    In the HTML, include usage like:

    ```html
    <h2>Demo: Draggable Number</h2>
    <cc-draggable-number id="demo-number" value="42"></cc-draggable-number>
    <p>Current value: <span id="display">42</span></p>
    <script type="module">
      import 'cc-web-components';  // if published, or relative path if dev
      const demoNum = document.getElementById('demo-number');
      const display = document.getElementById('display');
      demoNum.addEventListener('change', (e) => {
        display.textContent = demoNum.value;
      });
    </script>
    ```

    This example simply shows the component and displays its value outside. It listens for a
    custom change event (we would emit that from our component whenever the value changes). This
    allows a user to drag the number and see the external display update live. We should confirm
    our component fires an event or integrates with `<input>` such that standard events happen.

    We might make the example more elaborate later or include multiple components on one page.

7.  Documentation: Write usage instructions in the main README (or a docs folder). We can
    document how to install the package (once on NPM), how to import and register the elements
    (if not using the auto registration from module), and show code examples. Also include the
    screenshots we already have for motivation, and perhaps a GIF of the component in action
    once it’s working. Documentation is ongoing, but setting up a framework (like deciding if we
    want a GitHub Pages site or Storybook for interactive docs) is good. Using Storybook is an
    option for a component library; we could integrate Storybook to showcase each component in
    isolation. However, that might be overkill initially, given we have our examples. Still, as a
    best practice suggestion: consider adding Storybook (with a Web Components setup) later so
    that both developers and users can see the components live and read their documentation.

8.  Linting/Formatting Config: Add config files for ESLint (.eslintrc.js) and Prettier (.prettierrc).
    Possibly use eslint:recommended plus plugin:lit/recommended and
    plugin:@typescript-eslint/recommended (if TS). Also add a script
    `"lint": "eslint --ext .ts,.js src"` to package.json. For Prettier, ensure it runs (maybe
    integrate with ESLint or a separate script). Also set up rustfmt.toml if needed (or just rely
    on default rustfmt). These help maintain code quality from the start.

At this point, running `npm run dev` should start Vite’s dev server, compile our TS (and possibly
trigger Rust build if configured), and serve the example page. We can manually test the component
in the browser, using devtools to ensure everything is working (and no console errors, etc.).
Once development is iterative, we use HMR for TS changes; for Rust changes, if not automated,
run `npm run build:wasm` again and refresh.

### Example Consumer Project

To validate that our components work in real-world scenarios, we should test them in at least one
consumer project. We have the examples/basic-demo which is a simple usage. We could go further and
create an integration test project such as:

  - Framework integration example: For instance, a small React app that uses our web component.
    This can be done by creating another folder in examples/ like react-app/ (maybe using Create
    React App or Vite + React) and then installing our cc-web-components library (if published,
    via npm, or if not, via a local path or by linking the dist). Then use
    `<cc-draggable-number>` inside a React component (perhaps by wrapping it in a React component
    or using the reactify pattern). The point is to ensure that using our web components in React
    (or Angular/Vue) works as expected. However, doing this might be beyond initial scope – it
    could be a later step. As an initial demonstration, the vanilla example is enough, but noting
    the cross-framework capability (which is inherently supported by Web Components) is good.

  - Documentation demo page: We could plan to host the basic-demo/index.html on GitHub Pages
    so that potential users can see the component in action. If we automate deployment of the
    examples folder to GH Pages via Actions, that would be a nice touch (so every push updates
    a live demo site).

For now, the included example ensures that someone cloning the repo can run npm run dev and play
with the component on a test page. We will keep the example minimal but representative.

### Testing Strategy

We will implement a comprehensive testing strategy encompassing both unit tests and possible
integration tests:

  - Unit Tests (Vitest): We’ll write unit tests for each component’s logic. For example, we might
    instantiate `<cc-draggable-number>` in a test (Vitest allows
    `document.createElement('cc-draggable-number')` since our component class will be registered,
    especially if we import src/index.ts in the test setup). We can then set properties and call
    methods to ensure internal state changes correctly. If the component emits a change event,
    our test can listen for that event. If the component updates its shadow DOM, we can either
    reach into el.shadowRoot to verify content (e.g., check that the displayed text matches the
    value property) or, in Lit, use Lit’s testing utilities to update and assert rendered output.
    We will also test edge cases: extremely large or small values, negative values, etc., to ensure
    the component (and any Rust logic) handles them.

  - Rust Unit Tests: On the Rust side, we can also include tests within the Rust crate (using Rust’s
    `#[cfg(test)] mod tests` in lib.rs). These tests can directly call Rust functions (which might
    be internal logic not exposed via WASM) to ensure they behave correctly. Running cargo test
    should be part of our CI to verify the Rust logic in isolation. For example, if we have a
    Rust function to “nudge” a value by some delta with certain acceleration curve, we can test
    that pure function in Rust. This will give us confidence that the heavy lifting logic is
    solid before it’s integrated with the UI.

  - Integration Tests (Browser-based): As the library stabilizes, we might want some tests that
    simulate user interactions in a real browser environment. Tools like Playwright or Puppeteer
    can automate a headless browser. For instance, using Playwright we could launch a browser
    with our demo page, programmatically perform a mouse drag on the component, and assert that
    the value changed appropriately in the page. This kind of test would catch any issues with
    event handling or shadow DOM that a jsdom environment might not fully capture. We can set up
    a few critical integration tests like this and possibly run them in CI (Playwright has GitHub
    Action integrations, and it can use headless Chrome). However, these tests can be a bit
    slower, so we’d probably have a small suite of them, whereas the majority of tests are fast
    Vitest unit tests.

  - Testing Accessibility: It’s good practice to also consider accessibility. We should ensure
    our components can be operated via keyboard (e.g., focus on the number input, arrow keys maybe
    increment it, etc.). We can use testing-library’s queries to verify ARIA attributes or focus
    management. For example, after focusing and pressing arrow up, does the value increment?
    This might require simulating keyboard events in tests.

  - Continuous Testing: All these tests will run in CI on each push. We’ll use npm test to run
    the Vitest suite (which can include Rust tests if we call cargo test too, or we run cargo
    test separately). The goal is to catch regressions quickly. We might also set up coverage
    reporting with Vitest to ensure our tests cover the code well.

### Documentation Strategy

Documentation is vital for a component library. Our strategy will include:

  - Comprehensive README: The main README will serve as the introductory documentation. It will
    include the project’s purpose, how to install the library (e.g. via npm), basic usage
    examples (code snippets showing how to use each component), and possibly animated GIFs
    or images demonstrating the components in action. Since we already have some images
    illustrating the concept, we’ll update the README as we implement features (e.g., include
    a screenshot of our actual web component being used in a demo app, to show the drag behavior
    on the web).

  - API Reference: If the library grows, we might maintain an API reference (perhaps as a separate
    markdown or generated documentation). For example, listing all components and their properties,
    methods, and events. We could use TypeScript doc comments and a documentation generator like
    TypeDoc to create an HTML or markdown reference. Alternatively, a simple table in the README
    for each component’s attributes and events might suffice initially.

  - Storybook or Styleguide: As a stretch goal, setting up Storybook could be very helpful.
    Storybook provides an interactive UI to showcase components with different props in isolation.
    There is Storybook support for web components (and Lit specifically). With Storybook, we can
    create “stories” for `<cc-draggable-number>` showing it in various states, and even allow
    controls for the user to play with props. Storybook can also serve as living documentation,
    where each story can have markdown notes. If time permits, we will set up Storybook in the
    repository (this would add some dev dependencies, but it’s compartmentalized). Storybook
    could later be deployed as a static site (e.g., to GitHub Pages or Netlify) for users to
    browse.

  - Examples and Guides: We should maintain the examples/ directory with at least one example
    (which we have). We might add a more complex example or a tutorial-like guide: for instance,
    “Using CC Web Components in a React project” – this could be a short guide in docs or a
    blog-style write-up, to help users of frameworks integrate our components (covering any
    quirks like attaching event listeners in React, etc.). This might not be needed if we ensure
    everything just works, but it’s a nice addition.

  - Changelog: As we use GitHub and possibly publish versions, we’ll keep a CHANGELOG.md noting
    new features, breaking changes, etc., so that users (and we) can track progress. This is part
    of documentation for those upgrading versions.

  - Inline Docs: Ensure our code is well-commented, especially the Rust part where others might
    not be as familiar. Use doc comments in Rust for any public functions (which wasm-bindgen
    might expose). In TS, use JSDoc comments on classes and public methods/properties so that
    IDEs show hints and any generated docs include them.

By combining these documentation approaches, we aim to make the project approachable both for
contributors (developers working on the library) and consumers (developers using the library
in their apps).

### GitHub Actions CI/CD Pipeline

We will set up a GitHub Actions workflow to automate building, testing, and releasing the library.
The workflow (stored in .github/workflows/ci.yml) will look roughly like this:

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: node-deps-${{ hashFiles('package-lock.json') }}
          restore-keys: node-deps-
      - name: Install NPM dependencies
        run: npm ci
      - name: Set up Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
          profile: minimal
      - name: Cache cargo registry and cargo build
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/registry
            target
          key: rust-deps-${{ hashFiles('Cargo.lock') }}
          restore-keys: rust-deps-
      - name: Build Rust to WASM
        run: npm run build:wasm   # calls wasm-pack or cargo build for WASM
      - name: Run Tests (Rust)
        run: cargo test --all --release
      - name: Run Tests (Vitest)
        run: npm run test -- --coverage   # run JS/TS tests, possibly with coverage
      - name: Build Library (Vite)
        run: npm run build       # produces the dist files
      - name: Run Lint
        run: npm run lint
      - name: Upload Coverage Report
        if: success() && fileExists('coverage/')
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```

This build-test job does everything on each push/PR: it checks out the code, sets up Node and
Rust, caches dependencies for speed, builds the Rust WASM, runs Rust tests, runs JS tests, lints,
and builds the library. The caching of ~/.cargo/registry and target will greatly speed up Rust
compilation after the first run, and caching ~/.npm (or node_modules) speeds up npm install.
We use wasm32-unknown-unknown target for Rust as required for wasm-bindgen. We run tests in
release mode for Rust (--release) to ensure the optimized code doesn’t have different behavior
(and it’s faster). Vitest is run in coverage mode perhaps to collect coverage (optional).

If all steps pass, we know the commit is good. We might also consider adding a matrix for
different OS (windows-latest, macos-latest) or different Node versions to ensure broad
compatibility, but since this is a library (mostly OS-agnostic except the Rust build), we can
stick to Ubuntu for simplicity.

For the CD (Continuous Deployment) part – publishing to NPM – we can extend this workflow or
use a separate one. One safe approach is to publish only when a new Git tag is pushed. For example:

```yaml
  publish:
    needs: build-test
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - name: Install and Build
        run: |
          npm ci
          npm run build:wasm
          npm run build
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This job triggers when we push a tag like v1.0.0. It assumes we have an NPM token stored in the
repository secrets. It rebuilds the project (to be sure we’re packaging the latest code) and then
runs npm publish. We’d configure package.json with the proper name, version (which should match
the tag ideally), and files to include (we’ll ensure dist/ and the .wasm file are included in
the package, possibly via an "files" field or by not excluding them).

By structuring the workflow with a separate publish step dependent on tests passing, we ensure we
only release when the build is green. Also, using tags to trigger means we control releases
explicitly.

Additionally, we might configure the CI to run on main branch pushes and PRs as above, but not
on every branch to reduce noise. We can also add a schedule trigger (like daily) if we want to
ensure things still build (not crucial unless we have upstream dep updates to catch).

Finally, we’ll include badges in the README for build status and coverage (if we publish coverage
to a service or upload to Codecov, etc.).

### Closing Notes

Following this project plan, we will set up the cc-web-components repository with a solid
foundation. The combination of Web Components (Custom Elements + Shadow DOM), powered by
Rust/WASM for performance, and modern tools like Lit and Vite will enable us to create a
truly framework-agnostic, high-performance component library. By anticipating challenges and
implementing best practices (for development workflow, testing, and documentation), we aim
to ensure the project is not only fun and educational for the developer but also yields a useful
library that others can easily adopt. The end result will be a set of intuitive, novel UI controls
(like the draggable number input and beyond) that can enhance user experiences in web applications,
much like Adobe’s UIs have done on the desktop. With the project infrastructure in place, the
next steps will be to incrementally build and refine each component, continuously testing and
documenting as we go. The journey will involve deep dives into both Rust and Web APIs, fulfilling
the learning goals while producing something concretely valuable.
