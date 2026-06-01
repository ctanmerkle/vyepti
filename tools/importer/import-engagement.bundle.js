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

  // tools/importer/import-engagement.js
  var import_engagement_exports = {};
  __export(import_engagement_exports, {
    default: () => import_engagement_default
  });

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

  // tools/importer/import-engagement.js
  var PAGE_TEMPLATE = {
    name: "engagement",
    description: "Community engagement pages for sharing stories and staying connected",
    urls: [
      "https://www.vyepti.com/share-your-migraine-story",
      "https://www.vyepti.com/stay-connected"
    ],
    blocks: []
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
  var import_engagement_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
          blocks: []
        }
      }];
    }
  };
  return __toCommonJS(import_engagement_exports);
})();
