import { loadScript } from '../../scripts/aem.js';

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
let guideData = null;
let answers = {};
let currentStep = 0;
let userName = '';

async function loadGuideData() {
  const resp = await fetch(`${window.hlx?.codeBasePath || ''}/blocks/discussion-guide/guide-data.json`);
  guideData = await resp.json();
}

function collectAnswers(block) {
  const checked = block.querySelectorAll('.ddg-options input:checked');
  answers[currentStep] = Array.from(checked).map((input) => input.value);
}

async function generatePDF(block) {
  const content = block.querySelector('.ddg-content');
  content.innerHTML = '<div class="ddg-loading"><p>Generating your discussion guide...</p></div>';

  await loadScript(JSPDF_CDN);
  const { jsPDF: JsPDF } = window.jspdf;
  const doc = new JsPDF();

  const margin = 20;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);

  doc.setFontSize(22);
  doc.setTextColor(4, 97, 131);
  doc.text('My Doctor Discussion Guide', margin, y);
  y += 12;

  if (userName) {
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text(`Prepared for: ${userName}`, margin, y);
    y += 10;
  }

  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
  y += 12;

  doc.setDrawColor(4, 97, 131);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  guideData.steps.forEach((step, i) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(12);
    doc.setTextColor(4, 97, 131);
    doc.setFont(undefined, 'bold');
    const titleLines = doc.splitTextToSize(`${i + 1}. ${step.title}`, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 6 + 2;

    const stepAnswers = answers[i] || [];
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    if (stepAnswers.length > 0) {
      doc.setTextColor(51, 51, 51);
      stepAnswers.forEach((answer) => {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        doc.text(`• ${answer}`, margin + 4, y);
        y += 6;
      });
    } else {
      doc.setTextColor(153, 153, 153);
      doc.text('(No answer selected)', margin + 4, y);
      y += 6;
    }

    y += 8;
  });

  if (y > 240) {
    doc.addPage();
    y = margin;
  }
  y += 10;
  doc.setDrawColor(4, 97, 131);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  doc.setFont(undefined, 'normal');
  const footer = doc.splitTextToSize(
    'This guide is for informational purposes only and is not a substitute for professional medical advice. Please discuss your responses with your healthcare provider.',
    contentWidth,
  );
  doc.text(footer, margin, y);

  doc.save('VYEPTI-Doctor-Discussion-Guide.pdf');

  content.innerHTML = `<div class="ddg-success">
    <h2>Your guide has been downloaded!</h2>
    <p>Bring this guide to your next doctor's appointment to help start a conversation about whether VYEPTI could be right for you.</p>
    <button class="ddg-btn-restart">Start Over</button>
    <button class="ddg-btn-download">Download Again</button>
  </div>`;

  content.querySelector('.ddg-btn-restart').addEventListener('click', () => {
    answers = {};
    userName = '';
    currentStep = 0;
    renderStep(block); // eslint-disable-line no-use-before-define
  });

  content.querySelector('.ddg-btn-download').addEventListener('click', () => {
    doc.save('VYEPTI-Doctor-Discussion-Guide.pdf');
  });
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
    finishBtn.addEventListener('click', async () => {
      collectAnswers(block);
      await generatePDF(block);
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
        // eslint-disable-next-line no-use-before-define
        renderStep(block);
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
    const checked = stepAnswers.includes(option) ? 'checked' : '';
    const inputName = step.type === 'radio' ? `step-${currentStep}` : `step-${currentStep}-${i}`;
    html += `<label class="ddg-option">
      <input type="${inputType}" name="${inputName}" value="${option}" ${checked}>
      <span class="ddg-option-indicator"></span>
      <span class="ddg-option-text">${option}</span>
    </label>`;
  });

  if (step.hasNoneOption) {
    const checked = stepAnswers.includes('None of the above') ? 'checked' : '';
    html += `<label class="ddg-option ddg-option-none">
      <input type="radio" name="step-${currentStep}-none" value="None of the above" ${checked}>
      <span class="ddg-option-indicator"></span>
      <span class="ddg-option-text">None of the above</span>
    </label>`;
  }

  html += '</div>';

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
  block.textContent = '';

  await loadGuideData();

  const wrapper = document.createElement('div');
  wrapper.className = 'ddg-wrapper';
  wrapper.innerHTML = `
    <div class="ddg-progress"></div>
    <div class="ddg-content"></div>
  `;
  block.append(wrapper);

  renderStep(block);
}
