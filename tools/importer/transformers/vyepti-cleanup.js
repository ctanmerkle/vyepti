/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: VYEPTI site-wide cleanup.
 * Removes non-authorable content: cookie consent, header, footer, modals, tracking, empty AEM parsys.
 * All selectors verified from captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie Information consent banner and overlay (blocks parsing, large DOM tree)
    // Found: <div id="cookie-information-template-wrapper"> containing #coiConsentBanner, #coiOverlay
    WebImporter.DOMUtils.remove(element, [
      '#cookie-information-template-wrapper',
    ]);

    // Interstitial modals (internal-link-modal, external-link-modal, patient-site-modal, prescription-modal)
    // Found: <div class="interstitialmodal">, <div class="popupinterstitialmodal">
    WebImporter.DOMUtils.remove(element, [
      '.interstitialmodal',
      '.popupinterstitialmodal',
    ]);

    // Modal backdrop overlay
    // Found: <div class="modal-backdrop fade show">
    WebImporter.DOMUtils.remove(element, [
      '.modal-backdrop',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Header experience fragment (site-wide navigation, not authorable)
    // Found: <div class="cmp-experiencefragment cmp-experiencefragment--header">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
    ]);

    // Header element (mobile + desktop nav)
    // Found: <header class="header-section">
    WebImporter.DOMUtils.remove(element, [
      'header.header-section',
    ]);

    // Footer experience fragment (site-wide footer, not authorable)
    // Found: <div class="cmp-experiencefragment cmp-experiencefragment--footer">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--footer',
    ]);

    // Footer element
    // Found: <footer id="footer">
    WebImporter.DOMUtils.remove(element, [
      'footer#footer',
    ]);

    // Footer iparsys container (empty AEM infrastructure)
    // Found: <div class="footer iparsys parsys">
    WebImporter.DOMUtils.remove(element, [
      '.footer.iparsys',
    ]);

    // Empty AEM parsys elements (newpar, iparys_inherited with no useful content)
    // Found: <div class="newpar new section">, <div class="par iparys_inherited">
    WebImporter.DOMUtils.remove(element, [
      '.newpar',
    ]);

    // Remove empty iparys_inherited divs (only if they have no meaningful content after other removals)
    const iparys = element.querySelectorAll('.par.iparys_inherited');
    iparys.forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, a, p, h1, h2, h3, h4, h5, h6')) {
        el.remove();
      }
    });

    // Tracking iframes (Adobe demdex, DoubleClick)
    // Found: <iframe title="Adobe ID Syncing iFrame" ...>, <iframe src="https://14213245.fls.doubleclick.net/...">
    WebImporter.DOMUtils.remove(element, [
      'iframe',
    ]);

    // Tracking pixel images (Google Ads, DoubleClick)
    // Found: <img src="https://www.googleadservices.com/pagead/conversion/...">
    const trackingImgs = element.querySelectorAll('img[src*="googleadservices.com"], img[src*="doubleclick.net"], img[src*="demdex.net"]');
    trackingImgs.forEach((img) => img.remove());

    // Remove link, noscript, source elements (non-content)
    WebImporter.DOMUtils.remove(element, [
      'link',
      'noscript',
      'source',
    ]);
  }
}
