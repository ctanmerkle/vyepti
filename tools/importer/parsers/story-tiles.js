/* eslint-disable */
/* global WebImporter */

/**
 * Parser for story-tiles
 * Base block: story-tiles
 * Source: https://www.vyepti.com/real-patient-stories
 * Selector: .columncontainer.section (the .asset-card grid)
 * Generated: 2026-08-04
 *
 * Grid of patient "asset cards". Each card is an image tile or a video tile.
 * Source structure per card:
 *   .asset-card[data-asset-type="image|video"]
 *     .assetcard[data-video-id][data-account-id][data-player-id]   (video only)
 *       .text-wrapper
 *         .text-title            -> tile title
 *         .text-description .text-ellipse  -> quote / description (HTML paragraphs)
 *       .image-wrapper
 *         picture > source[srcset]   -> tile image (desktop source preferred)
 *
 * Output block model (2 cells per row):
 *   [ image ] [ heading + description (+ Brightcove link for videos) ]
 */

// Prefer the largest/desktop image source from the card's <picture>.
function pickImage(card, document) {
  const wrapper = card.querySelector('.image-wrapper');
  if (!wrapper) return null;

  // A direct <img> with a real src wins.
  const directImg = wrapper.querySelector('img[src]');
  if (directImg && !/mvp-indicator|play-blue|playicon/i.test(directImg.getAttribute('src') || '')) {
    return directImg;
  }

  // Otherwise reconstruct from the desktop <source> (min-width: 1024px), falling back to the first.
  const sources = [...wrapper.querySelectorAll('picture source[srcset]')];
  const desktop = sources.find((s) => /min-width:\s*1024px/.test(s.media)) || sources[0];
  if (!desktop) return null;

  let src = desktop.srcset.split(',')[0].trim().split(/\s+/)[0];
  if (src.startsWith('//')) src = `https:${src}`;

  // Derive alt text from the title.
  const title = card.querySelector('.text-title');
  const img = document.createElement('img');
  img.src = src;
  img.alt = title ? title.textContent.trim() : '';
  return img;
}

export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.asset-card');
  // Defensive: if this container has no asset cards, leave it untouched.
  if (!cards.length) return;

  const cells = [];

  cards.forEach((card) => {
    const isVideo = card.dataset.assetType === 'video';

    // --- image cell ---
    const image = pickImage(card, document);

    // --- body cell ---
    const body = [];

    const title = card.querySelector('.text-title');
    if (title && title.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = title.textContent.trim();
      body.push(h);
    }

    const desc = card.querySelector('.text-description .text-ellipse, .text-ellipse');
    if (desc) {
      // Some tiles wrap their description text in dead expand anchors
      // (<a href="javascript:void(0)">…</a>). Unwrap those to plain text,
      // but keep real navigational links intact.
      desc.querySelectorAll('a[href^="javascript:"]').forEach((a) => {
        a.replaceWith(...a.childNodes);
      });
      desc.normalize();

      // Keep the authored paragraphs (quote + disclaimers).
      [...desc.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img')) body.push(child);
      });
    }

    // For video tiles, emit a Brightcove player link that the block turns into an embed.
    if (isVideo) {
      const ac = card.querySelector('.assetcard');
      const videoId = ac?.dataset.videoId;
      const accountId = ac?.dataset.accountId;
      const playerId = ac?.dataset.playerId;
      if (videoId && accountId && playerId) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        const href = `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?videoId=${videoId}`;
        a.href = href;
        a.textContent = 'Watch video';
        p.append(a);
        body.push(p);
      }
    }

    // Skip empty cards.
    if (!image && body.length === 0) return;

    cells.push([
      image || '',
      body,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'story-tiles', cells });
  element.replaceWith(block);
}
