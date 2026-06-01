/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature
 * Base block: cards
 * Source: https://www.vyepti.com/
 * Selector: .home-parsys
 * Generated: 2026-06-01
 *
 * 3-column icon-based feature cards grid. Each card has:
 * icon image on top, teal heading, descriptive paragraph, and a ghost-style CTA link with arrow.
 *
 * Source structure:
 *   .home-parsys > .container > .row > .col-12.col-lg-4.image-80 (x3)
 *     .boxedparsys > .boxed-parsys
 *       .img-wrapper > picture > img
 *       .description-after > h2 > span.dtc-teal-text, p
 *       .boxed-link > a.button-ghost-cta
 */
export default function parse(element, { document }) {
  // Find all card columns - each .image-80 column is one card
  const cardColumns = element.querySelectorAll('.image-80, [class*="col-lg-4"]');

  const cells = [];

  cardColumns.forEach((col) => {
    // Extract icon image from .img-wrapper
    const image = col.querySelector('.img-wrapper img, .img-wrapper picture');

    // Extract heading from .description-after h2
    const heading = col.querySelector('.description-after h2, .boxed-parsys h2');

    // Extract description paragraph from .description-after p
    const description = col.querySelector('.description-after p, .boxed-parsys p');

    // Extract CTA link from .boxed-link
    const ctaLink = col.querySelector('.boxed-link a, a.button-ghost-cta');

    // Remove the arrow-icon span from the CTA if present (keep just the text)
    if (ctaLink) {
      const arrowSpan = ctaLink.querySelector('.arrow-icon');
      if (arrowSpan) {
        arrowSpan.remove();
      }
    }

    // Build the card row: all content in a single cell (image, heading, description, CTA stacked)
    const cardContent = [];
    if (image) cardContent.push(image);
    if (heading) cardContent.push(heading);
    if (description) cardContent.push(description);
    if (ctaLink) cardContent.push(ctaLink);

    if (cardContent.length > 0) {
      // Each row is an array of cells; single-cell row wraps content in one array
      cells.push([cardContent]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
