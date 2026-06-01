/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/columns-hero.js
  function parse(element, { document }) {
    const teasers = element.querySelectorAll(".cmp-teaser");
    const cells = [];
    const row = [];
    teasers.forEach((teaser) => {
      const cellContent = [];
      const image = teaser.querySelector(".cmp-teaser__image img");
      if (image) {
        cellContent.push(image);
      }
      const descriptionContainer = teaser.querySelector(".cmp-teaser__content .cmp-teaser__description");
      if (descriptionContainer) {
        const paragraphs = descriptionContainer.querySelectorAll(":scope > p");
        paragraphs.forEach((p) => {
          cellContent.push(p);
        });
      }
      const ctaContainer = teaser.querySelector(".cmp-teaser__action-container");
      if (ctaContainer) {
        const ctaLink = ctaContainer.querySelector("a.cmp-teaser__action-link");
        if (ctaLink) {
          const arrowImg = ctaLink.querySelector("img.cmp-teaser__action-link-arrow");
          if (arrowImg) {
            arrowImg.remove();
          }
          cellContent.push(ctaLink);
        }
      }
      const secondary = teaser.querySelector(".cmp-teaser__description__secondary");
      if (secondary) {
        const secondaryText = secondary.querySelector("p");
        if (secondaryText) {
          cellContent.push(secondaryText);
        }
      }
      row.push(cellContent);
    });
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse2(element, { document }) {
    const cardColumns = element.querySelectorAll('.image-80, [class*="col-lg-4"]');
    const cells = [];
    cardColumns.forEach((col) => {
      const image = col.querySelector(".img-wrapper img, .img-wrapper picture");
      const heading = col.querySelector(".description-after h2, .boxed-parsys h2");
      const description = col.querySelector(".description-after p, .boxed-parsys p");
      const ctaLink = col.querySelector(".boxed-link a, a.button-ghost-cta");
      if (ctaLink) {
        const arrowSpan = ctaLink.querySelector(".arrow-icon");
        if (arrowSpan) {
          arrowSpan.remove();
        }
      }
      const cardContent = [];
      if (image) cardContent.push(image);
      if (heading) cardContent.push(heading);
      if (description) cardContent.push(description);
      if (ctaLink) cardContent.push(ctaLink);
      if (cardContent.length > 0) {
        cells.push([cardContent]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-testimonial.js
  function parse3(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(".slick-slide:not(.slick-cloned)");
    slides.forEach((slide) => {
      const row = [];
      const patientImg = slide.querySelector("img.vyepti-patient-image");
      if (patientImg) {
        const picture = patientImg.closest("picture") || patientImg;
        row.push(picture);
      }
      const contentCell = [];
      const quoteEl = slide.querySelector("h2");
      if (quoteEl) {
        const quoteText = quoteEl.textContent.trim();
        const h2 = document.createElement("h2");
        h2.textContent = quoteText;
        contentCell.push(h2);
      }
      const patientInfoEl = slide.querySelector("span.patient-info");
      if (patientInfoEl) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        const nameEl = patientInfoEl.querySelector("b");
        if (nameEl) {
          strong.textContent = nameEl.textContent.trim();
        }
        p.appendChild(strong);
        const fullText = patientInfoEl.textContent.trim();
        const nameText = nameEl ? nameEl.textContent.trim() : "";
        const suffix = fullText.replace(nameText, "");
        if (suffix) {
          p.appendChild(document.createTextNode(suffix));
        }
        contentCell.push(p);
      }
      const disclaimerEl = slide.querySelector("p.individual-result");
      if (disclaimerEl) {
        const p = document.createElement("p");
        p.textContent = disclaimerEl.textContent.trim();
        contentCell.push(p);
      }
      const ctaLink = slide.querySelector("a.watch-story-icon");
      if (ctaLink) {
        const a = document.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse4(element, { document }) {
    const cards = Array.from(element.querySelectorAll(":scope .bgcard-parsys.shadow-box, :scope .bgcard-parsys"));
    const row = [];
    cards.forEach((card) => {
      const cellContent = [];
      const eyebrow = card.querySelector("h4, .dtc-teal-text");
      if (eyebrow) {
        const eyebrowEl = eyebrow.tagName === "SPAN" ? eyebrow.closest("h4") || eyebrow : eyebrow;
        cellContent.push(eyebrowEl);
      }
      const heading = card.querySelector("h2, .red-text");
      if (heading) {
        const headingEl = heading.tagName === "SPAN" ? heading.closest("h2") || heading : heading;
        cellContent.push(headingEl);
      }
      const description = card.querySelector("p, .home-page-callout-desc-1");
      if (description) {
        cellContent.push(description);
      }
      const cta = card.querySelector("a.button-primary, .boxed-link a, a[href]");
      if (cta) {
        const link = document.createElement("a");
        link.href = cta.href;
        link.textContent = cta.textContent.trim();
        cellContent.push(link);
      }
      if (cellContent.length > 0) {
        row.push(cellContent);
      }
    });
    if (row.length === 0) {
      const directChildren = Array.from(element.querySelectorAll(":scope > div"));
      directChildren.forEach((child) => {
        const cellContent = [];
        const headings = Array.from(child.querySelectorAll("h2, h3, h4"));
        headings.forEach((h) => cellContent.push(h));
        const paras = Array.from(child.querySelectorAll("p"));
        paras.forEach((p) => cellContent.push(p));
        const links = Array.from(child.querySelectorAll("a[href]"));
        links.forEach((a) => {
          const link = document.createElement("a");
          link.href = a.href;
          link.textContent = a.textContent.trim();
          cellContent.push(link);
        });
        if (cellContent.length > 0) {
          row.push(cellContent);
        }
      });
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/vyepti-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#cookie-information-template-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".interstitialmodal",
        ".popupinterstitialmodal"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".modal-backdrop"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "header.header-section"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "footer#footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".footer.iparsys"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".newpar"
      ]);
      const iparys = element.querySelectorAll(".par.iparys_inherited");
      iparys.forEach((el) => {
        if (!el.textContent.trim() && !el.querySelector("img, a, p, h1, h2, h3, h4, h5, h6")) {
          el.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        "iframe"
      ]);
      const trackingImgs = element.querySelectorAll('img[src*="googleadservices.com"], img[src*="doubleclick.net"], img[src*="demdex.net"]');
      trackingImgs.forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [
        "link",
        "noscript",
        "source"
      ]);
    }
  }

  // tools/importer/transformers/vyepti-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) return;
        if (section.style) {
          const cells = [
            ["Section Metadata"],
            ["style", section.style]
          ];
          const table = WebImporter.DOMUtils.createTable(cells, document);
          sectionEl.after(table);
        }
        const isFirstSection = template.sections[0].id === section.id;
        if (!isFirstSection) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "columns-hero": parse,
    "cards-feature": parse2,
    "carousel-testimonial": parse3,
    "columns-cta": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Main landing page with hero, key messaging, and calls to action for VYEPTI migraine treatment",
    urls: ["https://www.vyepti.com/"],
    blocks: [
      {
        name: "columns-hero",
        instances: ["#vyepti-banner-swap"]
      },
      {
        name: "cards-feature",
        instances: [".home-parsys"]
      },
      {
        name: "carousel-testimonial",
        instances: [".quotescardcarousel"]
      },
      {
        name: "columns-cta",
        instances: [".bgcardparsys"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: "#vyepti-banner-swap",
        style: null,
        blocks: ["columns-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Help CTA Strip",
        selector: ".vyepti-homepage-call-cta",
        style: null,
        blocks: [],
        defaultContent: [".vyepti-homepage-call-cta .rteComponent p"]
      },
      {
        id: "section-3",
        name: "Feature Cards",
        selector: ".home-parsys",
        style: null,
        blocks: ["cards-feature"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Patient Testimonials Carousel",
        selector: ".quotescardcarousel",
        style: "grey",
        blocks: ["carousel-testimonial"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Bottom CTA Cards",
        selector: ".bgcardparsys",
        style: null,
        blocks: ["columns-cta"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Important Safety Information",
        selector: ".cmp-experiencefragment--isi",
        style: null,
        blocks: [],
        defaultContent: [".cmp-experiencefragment--isi .safetyInfo"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
