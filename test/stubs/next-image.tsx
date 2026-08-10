import { ComponentProps } from "react";

/**
 * next/image only resolves through Next's bundler, so tests that render SDK
 * components (which pull it in transitively) swap in the plain element.
 */
const NextImage = (props: ComponentProps<"img">) => <img {...props} />;

export default NextImage;
