/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta
 * Base block: columns
 * Source: https://www.vyepti.com/
 * Selector: .bgcardparsys
 * Generated: 2026-06-01
 *
 * 2-column CTA card layout with shadow-box styling.
 * Each column contains: eyebrow text (teal), heading (red), description paragraph, and a primary button CTA.
 * Columns are derived from .bgcard-parsys.shadow-box children within the container.
 */
export default function parse(element, { document }) {
  // Find all column cards within the container
  const cards = Array.from(element.querySelectorAll(':scope .bgcard-parsys.shadow-box, :scope .bgcard-parsys'));

  // Build one row with each card as a column cell
  const row = [];

  cards.forEach((card) => {
    const cellContent = [];

    // Eyebrow text (h4 with teal styling)
    const eyebrow = card.querySelector('h4, .dtc-teal-text');
    if (eyebrow) {
      // Get the h4 element if we matched the span, otherwise use the h4 directly
      const eyebrowEl = eyebrow.tagName === 'SPAN' ? eyebrow.closest('h4') || eyebrow : eyebrow;
      cellContent.push(eyebrowEl);
    }

    // Main heading (h2 with red styling)
    const heading = card.querySelector('h2, .red-text');
    if (heading) {
      const headingEl = heading.tagName === 'SPAN' ? heading.closest('h2') || heading : heading;
      cellContent.push(headingEl);
    }

    // Description paragraph
    const description = card.querySelector('p, .home-page-callout-desc-1');
    if (description) {
      cellContent.push(description);
    }

    // CTA button link
    const cta = card.querySelector('a.button-primary, .boxed-link a, a[href]');
    if (cta) {
      // Create a clean link without the arrow image
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      cellContent.push(link);
    }

    if (cellContent.length > 0) {
      row.push(cellContent);
    }
  });

  // If no cards found via specific class, fall back to direct child divs
  if (row.length === 0) {
    const directChildren = Array.from(element.querySelectorAll(':scope > div'));
    directChildren.forEach((child) => {
      const cellContent = [];
      const headings = Array.from(child.querySelectorAll('h2, h3, h4'));
      headings.forEach((h) => cellContent.push(h));
      const paras = Array.from(child.querySelectorAll('p'));
      paras.forEach((p) => cellContent.push(p));
      const links = Array.from(child.querySelectorAll('a[href]'));
      links.forEach((a) => {
        const link = document.createElement('a');
        link.href = a.href;
        link.textContent = a.textContent.trim();
        cellContent.push(link);
      });
      if (cellContent.length > 0) {
        row.push(cellContent);
      }
    });
  }

  // Columns block: single row with N cells (one per column)
  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
