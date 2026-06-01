/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: VYEPTI section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks where style is defined.
 * Runs only in afterTransform, uses payload.template.sections from page-templates.json.
 * All selectors verified from captured DOM (migration-work/cleaned.html):
 *   - #vyepti-banner-swap (line 1873)
 *   - .vyepti-homepage-call-cta (line 1945)
 *   - .home-parsys (line 1979)
 *   - .quotescardcarousel (line 2070)
 *   - .bgcardparsys (line 2422)
 *   - .cmp-experiencefragment--isi (line 2530)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };

    // Process sections in reverse order to avoid shifting DOM positions
    const sections = [...template.sections].reverse();

    sections.forEach((section) => {
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) return;

      // Add Section Metadata block after the section element if style is defined
      if (section.style) {
        const cells = [
          ['Section Metadata'],
          ['style', section.style],
        ];
        const table = WebImporter.DOMUtils.createTable(cells, document);
        sectionEl.after(table);
      }

      // Insert <hr> before the section element if it is not the first section
      const isFirstSection = template.sections[0].id === section.id;
      if (!isFirstSection) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
