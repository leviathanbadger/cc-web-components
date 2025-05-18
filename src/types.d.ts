declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare module '../../wasm-bindings/cc_web_components.js' {
  export function process_drag(delta: number): number;
}

declare module './cc_web_components.js' {
  export function process_drag(delta: number): number;
}
