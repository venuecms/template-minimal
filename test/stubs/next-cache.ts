/**
 * The SDK's reads sit behind `"use cache"` and tag themselves with `cacheTag`
 * and `cacheLife`. Both are compiler-backed: outside a Next build with
 * `cacheComponents` they throw, which under `renderToReadableStream` surfaces
 * as a component that bailed out to client rendering rather than as a failure
 * anyone can read. Caching is not what these tests exercise — they stub the
 * network and assert on markup — so the tags are dropped on the floor.
 */
export const cacheTag = (..._tags: Array<string>) => {};

export const cacheLife = (_profile: unknown) => {};

export const revalidateTag = (..._tags: Array<string>) => {};
