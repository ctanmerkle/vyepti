const DEFAULT_API_ENDPOINT = 'https://www.vyepti.com/api/doctordiscussionguide';
let guideData = null;
const answers = {};
let currentStep = 0;
let userName = '';
let apiEndpoint = DEFAULT_API_ENDPOINT;

async function loadGuideData() {
  const resp = await fetch(`${window.hlx?.codeBasePath || ''}/blocks/discussion-guide/guide-data.json`);
  guideData = await resp.json();
}

function readConfig(block) {
  const rows = block.querySelectorAll(':scope > div');
  const config = {};
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '-');
      const value = cells[1].textContent.trim();
      if (key && value) config[key] = value;
    }
  });
  return config;
}

function collectAnswers(block) {
  const checked = block.querySelectorAll('.ddg-options input:checked');
  answers[currentStep] = Array.from(checked).map((input) => input.value);
}

/**
 * Builds form data matching the original backend's expected field names.
 * Checkboxes use per-option field names (q1a1, q1a2...).
 * Radios share one field name per question (q3a1).
 */
function buildFormData() {
  const formData = new URLSearchParams();
  formData.append('fname', userName);

  guideData.steps.forEach((step, stepIndex) => {
    const stepAnswers = answers[stepIndex] || [];

    if (step.type === 'radio') {
      const selected = stepAnswers[0];
      if (selected) formData.append(step.radioField, selected);
    } else {
      step.options.forEach((option) => {
        if (stepAnswers.includes(option.label)) {
          formData.append(option.field, option.label);
        }
      });
      if (step.noneField && stepAnswers.includes('None of the above')) {
        formData.append(step.noneField, 'None of the above');
      }
    }
  });

  return formData;
}

function showError(content) {
  const errorEl = content.querySelector('.ddg-error-message');
  if (errorEl) errorEl.classList.remove('d-none');
}

function openPdfBlob(blob) {
  const fileURL = URL.createObjectURL(blob);
  // Safari needs a deferred window.open to avoid popup blocking
  if (navigator.userAgent.match(/Version\/[\d.]+.*Safari/)) {
    setTimeout(() => {
      const newWin = window.open(fileURL);
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        const blocker = document.querySelector('.ddg-popup-blocker');
        if (blocker) blocker.classList.remove('d-none');
      }
    }, 1000);
  } else {
    window.open(fileURL);
  }
}

async function submitGuide(block) {
  collectAnswers(block);
  const content = block.querySelector('.ddg-content');
  const finishBtn = content.querySelector('.ddg-btn-finish');
  if (finishBtn) {
    finishBtn.textContent = 'Generating...';
    finishBtn.disabled = true;
  }

  const errorEl = content.querySelector('.ddg-error-message');
  if (errorEl) errorEl.classList.add('d-none');

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildFormData().toString(),
    });

    if (!response.ok) {
      showError(content);
      if (finishBtn) {
        finishBtn.textContent = 'Generate My Guide';
        finishBtn.disabled = false;
      }
      return;
    }

    const blob = await response.blob();
    openPdfBlob(blob);

    if (finishBtn) {
      finishBtn.textContent = 'Generate My Guide';
      finishBtn.disabled = false;
    }
  } catch (e) {
    showError(content);
    if (finishBtn) {
      finishBtn.textContent = 'Generate My Guide';
      finishBtn.disabled = false;
    }
  }
}

function attachStepListeners(block) {
  const nameInput = block.querySelector('#ddg-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => { userName = nameInput.value; });
  }

  const checkboxes = block.querySelectorAll('.ddg-options input[type="checkbox"]');
  const radios = block.querySelectorAll('.ddg-options input[type="radio"]');
  const noneInput = block.querySelector('.ddg-option-none input');

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      if (noneInput) noneInput.checked = false;
      collectAnswers(block);
    });
  });

  radios.forEach((r) => {
    r.addEventListener('change', () => {
      if (r.value === 'None of the above') {
        checkboxes.forEach((cb) => { cb.checked = false; });
      }
      collectAnswers(block);
    });
  });

  const goToStep = (step) => {
    currentStep = step;
    renderStep(block); // eslint-disable-line no-use-before-define
  };

  const nextBtn = block.querySelector('.ddg-btn-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      collectAnswers(block);
      goToStep(currentStep + 1);
      block.querySelector('.ddg-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const backBtn = block.querySelector('.ddg-btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  }

  const finishBtn = block.querySelector('.ddg-btn-finish');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      submitGuide(block);
    });
  }
}

function renderProgress(block) {
  const progress = block.querySelector('.ddg-progress');
  progress.innerHTML = '';
  guideData.steps.forEach((step, i) => {
    const dot = document.createElement('button');
    dot.className = 'ddg-progress-dot';
    dot.setAttribute('aria-label', `Step ${i + 1}`);
    if (i === currentStep) dot.classList.add('active');
    if (i < currentStep) dot.classList.add('completed');
    dot.disabled = i > currentStep;
    dot.addEventListener('click', () => {
      if (i <= currentStep) {
        currentStep = i;
        renderStep(block); // eslint-disable-line no-use-before-define
      }
    });
    progress.append(dot);
  });
}

function renderStep(block) {
  const content = block.querySelector('.ddg-content');
  const step = guideData.steps[currentStep];

  let html = `<div class="ddg-step-counter">${currentStep + 1} of ${guideData.steps.length}</div>`;
  html += `<h3 class="ddg-step-title"><span class="ddg-step-num">${currentStep + 1}</span> ${step.title}</h3>`;

  if (step.hasNameField && currentStep === 0) {
    html += `<div class="ddg-name-field">
      <label for="ddg-name">My name is <span class="ddg-optional">Optional</span></label>
      <input type="text" id="ddg-name" value="${userName}">
    </div>`;
  }

  if (step.question && step.question !== step.title) {
    html += `<h4 class="ddg-question">${step.question}</h4>`;
  }
  if (step.helpText) {
    html += `<p class="ddg-help-text">${step.helpText}</p>`;
  }

  html += '<div class="ddg-options">';
  const stepAnswers = answers[currentStep] || [];

  step.options.forEach((option, i) => {
    const inputType = step.type === 'checkbox' ? 'checkbox' : 'radio';
    const checked = stepAnswers.includes(option.label) ? 'checked' : '';
    const inputName = step.type === 'radio' ? `step-${currentStep}` : `step-${currentStep}-${i}`;
    html += `<label class="ddg-option">
      <input type="${inputType}" name="${inputName}" value="${option.label}" ${checked}>
      <span class="ddg-option-text">${option.label}</span>
    </label>`;
  });

  if (step.noneField) {
    const checked = stepAnswers.includes('None of the above') ? 'checked' : '';
    html += `<label class="ddg-option ddg-option-none">
      <input type="radio" name="step-${currentStep}-none" value="None of the above" ${checked}>
      <span class="ddg-option-text">None of the above</span>
    </label>`;
  }

  html += '</div>';

  html += '<p class="ddg-error-message d-none">An error occurred. Please refresh your page and try again later.</p>';

  html += '<div class="ddg-nav">';
  if (currentStep > 0) {
    html += '<button class="ddg-btn-back">Back</button>';
  }
  if (currentStep < guideData.steps.length - 1) {
    html += '<button class="ddg-btn-next">Next</button>';
  } else {
    html += '<button class="ddg-btn-finish">Generate My Guide</button>';
  }
  html += '</div>';

  content.innerHTML = html;
  renderProgress(block);
  attachStepListeners(block);
}

export default async function decorate(block) {
  const config = readConfig(block);
  apiEndpoint = config['api-endpoint'] || DEFAULT_API_ENDPOINT;

  block.textContent = '';

  await loadGuideData();

  const wrapper = document.createElement('div');
  wrapper.className = 'ddg-wrapper';
  wrapper.innerHTML = `
    <div class="ddg-progress"></div>
    <div class="ddg-content"></div>
    <div class="ddg-popup-blocker d-none">
      <p>Your guide opened in a new tab. If you don't see it, please disable your popup blocker and try again.</p>
    </div>
  `;
  block.append(wrapper);

  renderStep(block);
}
