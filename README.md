# cc-web-components

Experimenting with Codex to create WASM user controls/components mimicking some of the controls in Adobe
CC products, written in Rust.

One of the things I love about the Adobe Creative Cloud software is that there are new, very novel user
components that make it easy and intuitive to work with data and information that otherwise don't have a
standardized way to interact.

For example, if a user needs to enter a number that corresponds to a visual element with a continuous
property (not discrete steps), the standard way to implement that is to have a textbox that needs to be
parsed to a number. To change the value to see its effect, you have to literally type in a new number
each time, which prevents the value from being changed gradually and continuously. It also forces the
user to have an understanding of what the number's units represents, and very small changes or very
large changes can be hard to do because the user must change many digits, or digits far away from the
decimal point.

To contrast, in Adobe CC products, if you need to change a number, you can click and drag left+right to
shift the value continuously, allowing you to watch the results and intuitively pick the correct value
without having to understand the unit involved.

![Continuous Number Input](./readme-images/layer-transform-example1.png)

You can still click the number and type in a new value if you have to use an explicit value, but the
drag-to-change is a much more intuitive way to change the value when working on a visual element.

![Text Number Input](./readme-images/layer-transform-example2.png)

This is a very simple example, but there are many other components that are very useful and intuitive
to use. I want to create a library of these components in Rust, using WebAssembly to run them in the
browser. This will allow for high-performance, interactive user interfaces that can be easily
integrated into web applications. They'll show up as native components in the browser, using the shadow
DOM to keep usage simple, and can be used in any web application that supports WebAssembly, with any
framework, regardless of the underlying technology stack.

This project is mostly for fun. I want to learn or practice several new technologies, including Rust,
WebAssembly, the shadow DOM, the pointer events API, pointer lock, and modern web development techniques.
I may also use the Houdini CSS APIs to create CSS properties and animations customized for these
components. Finally, I'm intending to see how much of this can be automated using Codex, and how much
babysitting is required to get it to work.
