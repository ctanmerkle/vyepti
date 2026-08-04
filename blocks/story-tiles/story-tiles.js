import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Detects a Brightcove video URL and extracts its parts.
 * Expected form: https://players.brightcove.net/{account}/{player}_default/index.html?videoId={id}
 * @param {string} href
 * @returns {{account:string, player:string, videoId:string}|null}
 */
function parseBrightcove(href) {
  if (!href || !href.includes('players.brightcove.net')) return null;
  try {
    const url = new URL(href, window.location.origin);
    const [, account, playerSeg] = url.pathname.split('/');
    const player = (playerSeg || '').replace(/_default$/, '');
    const videoId = url.searchParams.get('videoId');
    if (account && player && videoId) return { account, player, videoId };
  } catch (e) {
    // ignore malformed URLs, fall through
  }
  return null;
}

/**
 * Builds the Brightcove iframe for a video tile and swaps it in on demand.
 * @param {Element} media the image-wrapper element
 * @param {{account:string, player:string, videoId:string}} bc
 * @param {string} title used for the iframe title (a11y)
 */
function loadVideo(media, bc, title) {
  const iframe = document.createElement('iframe');
  iframe.title = title || 'Video';
  iframe.allow = 'encrypted-media; fullscreen; autoplay';
  iframe.loading = 'lazy';
  iframe.src = `https://players.brightcove.net/${bc.account}/${bc.player}_default/index.html?videoId=${bc.videoId}&autoplay=true`;
  media.replaceChildren(iframe);
  media.classList.add('story-tiles-playing');
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'story-tiles-tile';

    // First cell that only contains an image is the tile media; the other is the body.
    const imageCell = cells.find((c) => c.children.length === 1 && c.querySelector('picture, img'));
    const bodyCell = cells.find((c) => c !== imageCell) || document.createElement('div');

    // --- media ---
    const media = document.createElement('div');
    media.className = 'story-tiles-media';
    const img = imageCell?.querySelector('img');
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 900px)', width: '700' },
        { width: '500' },
      ]));
    }

    // --- video detection ---
    const videoLink = [...bodyCell.querySelectorAll('a')]
      .map((a) => ({ a, bc: parseBrightcove(a.href) }))
      .find((x) => x.bc);
    const isVideo = Boolean(videoLink);
    if (isVideo) {
      li.classList.add('story-tiles-tile-video');
      videoLink.a.remove(); // link is consumed as config, not rendered
      const play = document.createElement('span');
      play.className = 'story-tiles-play';
      play.setAttribute('aria-hidden', 'true');
      media.append(play);
    }

    // --- body ---
    const body = document.createElement('div');
    body.className = 'story-tiles-body';
    while (bodyCell.firstElementChild) body.append(bodyCell.firstElementChild);

    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('story-tiles-title');

    const toggle = document.createElement('span');
    toggle.className = 'story-tiles-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    toggle.textContent = '+';
    body.append(toggle);

    li.append(media, body);

    // --- interaction: whole tile is a button ---
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'story-tiles-trigger';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', heading ? heading.textContent.trim() : 'Story');
    li.prepend(btn);

    btn.addEventListener('click', () => {
      const open = li.classList.toggle('story-tiles-open');
      btn.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '−' : '+'; // minus / plus
      if (open && isVideo && !media.classList.contains('story-tiles-playing')) {
        loadVideo(media, videoLink.bc, heading?.textContent);
      }
    });

    ul.append(li);
  });

  block.replaceChildren(ul);
}
