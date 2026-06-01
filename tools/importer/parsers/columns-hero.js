/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-hero variant.
 * Base block: columns
 * Source selector: #vyepti-banner-swap
 * Description: 2-column split-image hero layout. Each column has a teaser image
 * with overlaid text. Column 1 = patient image + "nope" text.
 * Column 2 = patient image + "say yep to VYEPTI" text + CTA button.
 * Generated: 2026-06-01
 */
export default function parse(element, { document }) {
  // Find the two teaser columns within the banner
  const teasers = element.querySelectorAll('.cmp-teaser');

  const cells = [];

  // Build one row with a cell per column (standard columns block structure)
  const row = [];

  teasers.forEach((teaser) => {
    const cellContent = [];

    // Extract the teaser image
    const image = teaser.querySelector('.cmp-teaser__image img');
    if (image) {
      cellContent.push(image);
    }

    // Extract description paragraphs from .cmp-teaser__description
    const descriptionContainer = teaser.querySelector('.cmp-teaser__content .cmp-teaser__description');
    if (descriptionContainer) {
      const paragraphs = descriptionContainer.querySelectorAll(':scope > p');
      paragraphs.forEach((p) => {
        cellContent.push(p);
      });
    }

    // Extract CTA link if present (only in column 2)
    const ctaContainer = teaser.querySelector('.cmp-teaser__action-container');
    if (ctaContainer) {
      const ctaLink = ctaContainer.querySelector('a.cmp-teaser__action-link');
      if (ctaLink) {
        // Remove the arrow image inside the link, keep only text
        const arrowImg = ctaLink.querySelector('img.cmp-teaser__action-link-arrow');
        if (arrowImg) {
          arrowImg.remove();
        }
        cellContent.push(ctaLink);
      }
    }

    // Extract secondary description (e.g., "Actor portrayal")
    const secondary = teaser.querySelector('.cmp-teaser__description__secondary');
    if (secondary) {
      const secondaryText = secondary.querySelector('p');
      if (secondaryText) {
        cellContent.push(secondaryText);
      }
    }

    row.push(cellContent);
  });

  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-hero', cells });
  element.replaceWith(block);
}
