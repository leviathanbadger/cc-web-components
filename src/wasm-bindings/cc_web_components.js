export async function init() {
    // This stub mimics the wasm-bindgen generated init function
    // In a real build, this would fetch and instantiate the WebAssembly module.
    return {
        process_drag
    };
}

export function process_drag(delta) {
    // Stub implementation that just returns the delta.
    // Actual logic will live in Rust and be compiled to WASM.
    return delta;
}
