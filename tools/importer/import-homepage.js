/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsHeroParser from './parsers/columns-hero.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import carouselTestimonialParser from './parsers/carousel-testimonial.js';
import columnsCtaParser from './parsers/columns-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/vyepti-cleanup.js';
import sectionsTransformer from './transformers/vyepti-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-hero': columnsHeroParser,
  'cards-feature': cardsFeatureParser,
  'carousel-testimonial': carouselTestimonialParser,
  'columns-cta': columnsCtaParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Main landing page with hero, key messaging, and calls to action for VYEPTI migraine treatment',
  urls: ['https://www.vyepti.com/'],
  blocks: [
    {
      name: 'columns-hero',
      instances: ['#vyepti-banner-swap'],
    },
    {
      name: 'cards-feature',
      instances: ['.home-parsys'],
    },
    {
      name: 'carousel-testimonial',
      instances: ['.quotescardcarousel'],
    },
    {
      name: 'columns-cta',
      instances: ['.bgcardparsys'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '#vyepti-banner-swap',
      style: null,
      blocks: ['columns-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Help CTA Strip',
      selector: '.vyepti-homepage-call-cta',
      style: null,
      blocks: [],
      defaultContent: ['.vyepti-homepage-call-cta .rteComponent p'],
    },
    {
      id: 'section-3',
      name: 'Feature Cards',
      selector: '.home-parsys',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Patient Testimonials Carousel',
      selector: '.quotescardcarousel',
      style: 'grey',
      blocks: ['carousel-testimonial'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Bottom CTA Cards',
      selector: '.bgcardparsys',
      style: null,
      blocks: ['columns-cta'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Important Safety Information',
      selector: '.cmp-experiencefragment--isi',
      style: null,
      blocks: [],
      defaultContent: ['.cmp-experiencefragment--isi .safetyInfo'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
