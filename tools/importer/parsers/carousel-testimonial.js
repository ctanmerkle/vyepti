/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-testimonial
 * Base block: carousel
 * Source: https://www.vyepti.com/
 * Selector: .quotescardcarousel
 * Description: Patient testimonial carousel with quote text, patient photo, name, disclaimer, and CTA link.
 * Generated: 2026-06-01
 */
export default function parse(element, { document }) {
  const cells = [];

  // Get all real slides (skip slick-cloned duplicates)
  const slides = element.querySelectorAll('.slick-slide:not(.slick-cloned)');

  slides.forEach((slide) => {
    const row = [];

    // Extract patient photo from the image column
    const patientImg = slide.querySelector('img.vyepti-patient-image');
    if (patientImg) {
      const picture = patientImg.closest('picture') || patientImg;
      row.push(picture);
    }

    // Build content cell with quote, patient info, disclaimer, and CTA
    const contentCell = [];

    // Quote text from h2 > span.patient-quotes
    const quoteEl = slide.querySelector('h2');
    if (quoteEl) {
      // Create a clean heading with just the quote text
      const quoteText = quoteEl.textContent.trim();
      const h2 = document.createElement('h2');
      h2.textContent = quoteText;
      contentCell.push(h2);
    }

    // Patient name and label (e.g., "Nicole, VYEPTI patient")
    const patientInfoEl = slide.querySelector('span.patient-info');
    if (patientInfoEl) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const nameEl = patientInfoEl.querySelector('b');
      if (nameEl) {
        strong.textContent = nameEl.textContent.trim();
      }
      p.appendChild(strong);
      // Get the remaining text after the bold name (e.g., ", VYEPTI patient")
      const fullText = patientInfoEl.textContent.trim();
      const nameText = nameEl ? nameEl.textContent.trim() : '';
      const suffix = fullText.replace(nameText, '');
      if (suffix) {
        p.appendChild(document.createTextNode(suffix));
      }
      contentCell.push(p);
    }

    // Disclaimer text (e.g., "Individual results may vary. Nicole was compensated...")
    const disclaimerEl = slide.querySelector('p.individual-result');
    if (disclaimerEl) {
      const p = document.createElement('p');
      p.textContent = disclaimerEl.textContent.trim();
      contentCell.push(p);
    }

    // CTA link (e.g., "Watch Nicole's story")
    const ctaLink = slide.querySelector('a.watch-story-icon');
    if (ctaLink) {
      const a = document.createElement('a');
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim();
      contentCell.push(a);
    }

    if (contentCell.length > 0) {
      row.push(contentCell);
    }

    if (row.length > 0) {
      cells.push(row);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-testimonial', cells });
  element.replaceWith(block);
}
