// Empty stub aliased to the `server-only` package under vitest. The real
// package throws if imported into a client bundle; in the node-based test
// runner there is no such boundary, so server-only modules (e.g. the
// choropleth data loader) can be unit-tested by treating the marker as a
// no-op. Aliased in `vitest.config.ts`.
export {};
