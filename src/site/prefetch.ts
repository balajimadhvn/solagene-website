// Indirection so the layout can prefetch page chunks in the browser without the server (prerender) bundle
// importing the lazy page map. App.tsx installs the real implementation.
let impl: (path: string) => void = () => {};
export const prefetch = (path: string) => impl(path);
export const setPrefetch = (f: (path: string) => void) => { impl = f; };
