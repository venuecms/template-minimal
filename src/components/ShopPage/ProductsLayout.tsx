/**
 * The frame a products listing sits in — and only the frame.
 *
 * It draws no products of its own. /shop renders `ProductsListSection` into it;
 * a PRODUCTLIST page renders its own body into it, and the product listing block
 * in that body is what draws the records. That is the whole point of the split:
 * a page typed as a product list is an ordinary page whose content happens to
 * hold a products block, so the layout has no business fetching a second grid
 * and stacking it under the author's.
 */
export const ProductsLayout = ({ children }: { children: React.ReactNode }) => (
  <section className="py-20">{children}</section>
);
