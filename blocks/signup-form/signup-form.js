const DEFAULT_API_ENDPOINT = 'https://www.vyepti.com/api/dtc/signup';
const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

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

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function validateAge(dob) {
  const parts = dob.split('/');
  if (parts.length !== 3) return false;
  const birthDate = new Date(parts[2], parts[0] - 1, parts[1]);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 18;
}

function createField(id, label, type, options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'signup-field';
  if (options.optional) wrapper.classList.add('signup-field-optional');

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', id);
  labelEl.textContent = label;
  if (options.hint) {
    const hint = document.createElement('span');
    hint.className = 'signup-field-hint';
    hint.textContent = options.hint;
    labelEl.append(hint);
  }
  wrapper.append(labelEl);

  if (type === 'select') {
    const select = document.createElement('select');
    select.id = id;
    select.name = id;
    if (!options.optional) select.required = true;
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Select...';
    select.append(defaultOpt);
    (options.choices || []).forEach((choice) => {
      const opt = document.createElement('option');
      opt.value = choice;
      opt.textContent = choice;
      select.append(opt);
    });
    wrapper.append(select);
  } else {
    const input = document.createElement('input');
    input.type = type === 'phone' || type === 'date-masked' ? 'text' : type;
    input.id = id;
    input.name = id;
    if (options.placeholder) input.placeholder = options.placeholder;
    if (!options.optional) input.required = true;
    if (options.maxLength) input.maxLength = options.maxLength;
    wrapper.append(input);
  }

  const error = document.createElement('span');
  error.className = 'signup-field-error';
  wrapper.append(error);

  return wrapper;
}

function createRadioGroup(name, label, choices) {
  const wrapper = document.createElement('div');
  wrapper.className = 'signup-radio-group';

  const heading = document.createElement('h5');
  heading.textContent = label;
  wrapper.append(heading);

  const options = document.createElement('div');
  options.className = 'signup-radio-options';

  choices.forEach((choice) => {
    const optLabel = document.createElement('label');
    optLabel.className = 'signup-radio-label';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = name;
    radio.value = choice.toLowerCase();
    radio.required = true;
    const text = document.createElement('span');
    text.textContent = choice;
    optLabel.append(radio);
    optLabel.append(text);
    options.append(optLabel);
  });

  wrapper.append(options);
  return wrapper;
}

function buildForm() {
  const form = document.createElement('form');
  form.className = 'signup-form-fields';
  form.noValidate = true;

  const note = document.createElement('p');
  note.className = 'signup-note';
  note.textContent = 'All fields are required unless marked optional.';
  form.append(note);

  form.append(createRadioGroup('prescribed', 'Have you been prescribed VYEPTI?', ['Yes', 'No']));

  const fields = document.createElement('div');
  fields.className = 'signup-fields-grid';

  fields.append(createField('dob', 'Date of birth', 'date-masked', { placeholder: 'MM/DD/YYYY', hint: 'Must be 18+ years old to register', maxLength: 10 }));
  fields.append(createField('firstName', 'First name', 'text'));
  fields.append(createField('lastName', 'Last name', 'text'));
  fields.append(createField('email', 'Email address', 'email'));
  fields.append(createField('phone', 'Mobile phone number', 'phone', { placeholder: '___-___-____', maxLength: 12 }));
  fields.append(createField('address1', 'Street address 1', 'text'));
  fields.append(createField('address2', 'Street address 2', 'text', { optional: true }));
  fields.append(createField('city', 'City', 'text'));
  fields.append(createField('state', 'State', 'select', { choices: STATES }));
  fields.append(createField('zip', 'ZIP code', 'text', { maxLength: 5 }));

  form.append(fields);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'signup-submit-btn';
  submitBtn.textContent = 'Submit';
  form.append(submitBtn);

  return form;
}

function attachMasks(form) {
  const phoneInput = form.querySelector('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(phoneInput.value);
    });
  }

  const dobInput = form.querySelector('#dob');
  if (dobInput) {
    dobInput.addEventListener('input', () => {
      dobInput.value = formatDate(dobInput.value);
    });
  }
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('.signup-field-error').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('.signup-field').forEach((field) => field.classList.remove('has-error'));

  const required = form.querySelectorAll('[required]');
  required.forEach((input) => {
    if (!input.value.trim()) {
      valid = false;
      const field = input.closest('.signup-field') || input.closest('.signup-radio-group');
      if (field) {
        field.classList.add('has-error');
        const error = field.querySelector('.signup-field-error');
        if (error) error.textContent = 'This field is required.';
      }
    }
  });

  const dob = form.querySelector('#dob');
  if (dob && dob.value && !validateAge(dob.value)) {
    valid = false;
    const field = dob.closest('.signup-field');
    field.classList.add('has-error');
    field.querySelector('.signup-field-error').textContent = 'You must be 18 or older to register.';
  }

  const email = form.querySelector('#email');
  if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    valid = false;
    const field = email.closest('.signup-field');
    field.classList.add('has-error');
    field.querySelector('.signup-field-error').textContent = 'Please enter a valid email address.';
  }

  const zip = form.querySelector('#zip');
  if (zip && zip.value && !/^\d{5}$/.test(zip.value)) {
    valid = false;
    const field = zip.closest('.signup-field');
    field.classList.add('has-error');
    field.querySelector('.signup-field-error').textContent = 'Please enter a valid 5-digit ZIP code.';
  }

  return valid;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const apiEndpoint = config['api-endpoint'] || DEFAULT_API_ENDPOINT;
  const signupCode = config['signup-code'] || 'EPT-B-100034-CON';

  block.textContent = '';

  const form = buildForm();
  block.append(form);
  attachMasks(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('.signup-submit-btn');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const payload = {
      prescribed: formData.get('prescribed'),
      dob: formData.get('dob'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address1: formData.get('address1'),
      address2: formData.get('address2'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip'),
      signupCode,
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        block.innerHTML = `
          <div class="signup-success">
            <h2>Thank you for signing up!</h2>
            <p>You're all set to receive updates about VYEPTI.</p>
          </div>
        `;
      } else {
        submitBtn.textContent = 'Submit';
        submitBtn.disabled = false;
        const errorMsg = document.createElement('p');
        errorMsg.className = 'signup-submit-error';
        errorMsg.textContent = 'Something went wrong. Please try again.';
        submitBtn.after(errorMsg);
      }
    } catch (err) {
      submitBtn.textContent = 'Submit';
      submitBtn.disabled = false;
      const errorMsg = document.createElement('p');
      errorMsg.className = 'signup-submit-error';
      errorMsg.textContent = 'Unable to submit. Please check your connection and try again.';
      submitBtn.after(errorMsg);
    }
  });
}
