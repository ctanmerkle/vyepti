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

  // tools/importer/import-patient-journey.js
  var import_patient_journey_exports = {};
  __export(import_patient_journey_exports, {
    default: () => import_patient_journey_default
  });

  // tools/importer/parsers/story-tiles.js
  function pickImage(card, document) {
    const wrapper = card.querySelector(".image-wrapper");
    if (!wrapper) return null;
    const directImg = wrapper.querySelector("img[src]");
    if (directImg && !/mvp-indicator|play-blue|playicon/i.test(directImg.getAttribute("src") || "")) {
      return directImg;
    }
    const sources = [...wrapper.querySelectorAll("picture source[srcset]")];
    const desktop = sources.find((s) => /min-width:\s*1024px/.test(s.media)) || sources[0];
    if (!desktop) return null;
    let src = desktop.srcset.split(",")[0].trim().split(/\s+/)[0];
    if (src.startsWith("//")) src = `https:${src}`;
    const title = card.querySelector(".text-title");
    const img = document.createElement("img");
    img.src = src;
    img.alt = title ? title.textContent.trim() : "";
    return img;
  }
  function parse(element, { document }) {
    const cards = element.querySelectorAll(".asset-card");
    if (!cards.length) return;
    const cells = [];
    cards.forEach((card) => {
      const isVideo = card.dataset.assetType === "video";
      const image = pickImage(card, document);
      const body = [];
      const title = card.querySelector(".text-title");
      if (title && title.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = title.textContent.trim();
        body.push(h);
      }
      const desc = card.querySelector(".text-description .text-ellipse, .text-ellipse");
      if (desc) {
        desc.querySelectorAll('a[href^="javascript:"]').forEach((a) => {
          a.replaceWith(...a.childNodes);
        });
        desc.normalize();
        [...desc.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("img")) body.push(child);
        });
      }
      if (isVideo) {
        const ac = card.querySelector(".assetcard");
        const videoId = ac == null ? void 0 : ac.dataset.videoId;
        const accountId = ac == null ? void 0 : ac.dataset.accountId;
        const playerId = ac == null ? void 0 : ac.dataset.playerId;
        if (videoId && accountId && playerId) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          const href = `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?videoId=${videoId}`;
          a.href = href;
          a.textContent = "Watch video";
          p.append(a);
          body.push(p);
        }
      }
      if (!image && body.length === 0) return;
      cells.push([
        image || "",
        body
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "story-tiles", cells });
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

  // tools/importer/import-patient-journey.js
  var parsers = {
    "story-tiles": parse
  };
  var PAGE_TEMPLATE = {
    name: "patient-journey",
    description: "Patient experience pages with treatment expectations, eligibility, and real patient testimonials",
    urls: [
      "https://www.vyepti.com/what-to-expect",
      "https://www.vyepti.com/could-vyepti-be-right-for-you",
      "https://www.vyepti.com/real-life-impact",
      "https://www.vyepti.com/real-patient-stories"
    ],
    blocks: [
      {
        name: "story-tiles",
        // Patient story asset-card grid (real-patient-stories). Parser bails on pages without cards.
        instances: [".columncontainer.section"]
      }
    ]
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_patient_journey_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
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
  return __toCommonJS(import_patient_journey_exports);
})();
