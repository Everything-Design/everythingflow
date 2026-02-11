
// ============================================================================
// ATTRIBUTE-BASED FORM VALIDATION SYSTEM WITH COUNTRY CODE SUPPORT
// ============================================================================
// Supports multiple forms on a single page with custom validation rules
// Includes CSS overrides for Lumos styleguide components
// ============================================================================

class FormValidator {
  constructor() {
    this.forms = new Map();
    this.blockedDomains = [];
    this.countryCodes = [];
    this.emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    this.injectLumosOverrides();
    this.init();
  }

  // ============================================================================
  // LUMOS CSS OVERRIDES
  // ============================================================================
  injectLumosOverrides() {
    if (document.getElementById('ef-lumos-overrides')) return;

    const style = document.createElement('style');
    style.id = 'ef-lumos-overrides';
    style.textContent = `
      /* =====================================================
         EF Form Validator — Lumos Style Guide Overrides
         ===================================================== */

      /* --- BASE RESETS: remove Lumos defaults on validated inputs --- */
      [ef-form-div] input[ef-form-input],
      [ef-form-div] textarea[ef-form-input],
      [ef-form-div] select[ef-form-select] {
        transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease !important;
      }

      /* --- FOCUS: prevent Lumos focus ring from overriding validation colors --- */
      [ef-form-div] input[ef-form-input]:focus,
      [ef-form-div] textarea[ef-form-input]:focus,
      [ef-form-div] select[ef-form-select]:focus {
        outline: none !important;
        box-shadow: none !important;
      }

      /* --- VALID STATE (light theme) --- */
      [ef-form-theme="light"] input[ef-form-input].ef-valid,
      [ef-form-theme="light"] textarea[ef-form-input].ef-valid,
      [ef-form-theme="light"] select[ef-form-select].ef-valid {
        border-color: #00A86B !important;
        background-color: var(--ef-bg-valid, initial) !important;
      }

      /* --- INVALID STATE (light theme) --- */
      [ef-form-theme="light"] input[ef-form-input].ef-invalid,
      [ef-form-theme="light"] textarea[ef-form-input].ef-invalid,
      [ef-form-theme="light"] select[ef-form-select].ef-invalid {
        border-color: #E2062C !important;
        background-color: var(--ef-bg-invalid, initial) !important;
      }

      /* --- VALID STATE (dark theme) --- */
      [ef-form-theme="dark"] input[ef-form-input].ef-valid,
      [ef-form-theme="dark"] textarea[ef-form-input].ef-valid,
      [ef-form-theme="dark"] select[ef-form-select].ef-valid {
        border-color: #00a86b !important;
        background-color: var(--ef-bg-valid, initial) !important;
      }

      /* --- INVALID STATE (dark theme) --- */
      [ef-form-theme="dark"] input[ef-form-input].ef-invalid,
      [ef-form-theme="dark"] textarea[ef-form-input].ef-invalid,
      [ef-form-theme="dark"] select[ef-form-select].ef-invalid {
        border-color: #e41e41 !important;
        background-color: var(--ef-bg-invalid, initial) !important;
      }

      /* --- BG COLOR OVERRIDES (applied via CSS vars when ef-bg is present) --- */
      [ef-form-theme="light"] [ef-bg].ef-valid {
        --ef-bg-valid: #cadcac;
      }
      [ef-form-theme="light"] [ef-bg].ef-invalid {
        --ef-bg-invalid: #F6ADC6;
      }
      [ef-form-theme="dark"] [ef-bg].ef-valid {
        --ef-bg-valid: #3a795e;
      }
      [ef-form-theme="dark"] [ef-bg].ef-invalid {
        --ef-bg-invalid: #9c0f31;
      }

      /* --- VALIDATION MESSAGES --- */
      [ef-form-div] [ef-form-msg] {
        font-size: 0.8125rem !important;
        line-height: 1.4 !important;
        margin-top: 0.25rem !important;
        padding: 0 !important;
        border: none !important;
        background: none !important;
        box-shadow: none !important;
      }

      [ef-form-theme="light"] [ef-form-msg] {
        color: #E2062C !important;
      }

      [ef-form-theme="dark"] [ef-form-msg] {
        color: #ff6b6b !important;
      }

      /* --- VALIDATION INDICATORS (checkmark / x icons) --- */
      [ef-form-div] [ef-form-val="right"],
      [ef-form-div] [ef-form-val="wrong"] {
        pointer-events: none !important;
        flex-shrink: 0 !important;
      }

      /* --- SUBMIT BUTTON: disabled state --- */
      [ef-form-div] [ef-form-submit]:disabled,
      [ef-form-div] [ef-form-submit][disabled] {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        pointer-events: auto !important;
      }

      [ef-form-div] [ef-form-submit]:not(:disabled) {
        opacity: 1 !important;
        cursor: pointer !important;
      }

      /* --- COUNTRY CODE SELECT: match input height/sizing --- */
      [ef-form-div] select[ef-form-select="Country Code"] {
        appearance: auto !important;
        -webkit-appearance: auto !important;
      }

      /* --- PLACEHOLDER STYLING --- */
      [ef-form-div] input[ef-form-input]::placeholder,
      [ef-form-div] textarea[ef-form-input]::placeholder {
        opacity: 0.6 !important;
        transition: opacity 0.2s ease !important;
      }

      [ef-form-div] input[ef-form-input]:focus::placeholder,
      [ef-form-div] textarea[ef-form-input]:focus::placeholder {
        opacity: 0.35 !important;
      }
    `;

    document.head.appendChild(style);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async init() {
    await Promise.all([
      this.loadBlockedDomains(),
      this.loadCountryCodes()
    ]);
    this.setupForms();
  }

  async loadBlockedDomains() {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/gh/Everything-Design/everythingflow@main/Email%20Restriction/email_domain.txt');
      const text = await response.text();
      this.blockedDomains = text.split('\n')
        .map(domain => domain.trim().toLowerCase())
        .filter(domain => domain.length > 0);
      console.log(`Loaded ${this.blockedDomains.length} blocked domains`);
    } catch (error) {
      console.error('Failed to load blocked domains:', error);
      this.blockedDomains = [];
    }
  }

  async loadCountryCodes() {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/gh/Everything-Design/everythingflow@main/phonenumber/phone_validation.txt');
      const text = await response.text();
      
      const jsonText = text.replace(/\]\s*\[/g, ',');
      this.countryCodes = JSON.parse(jsonText);
      
      this.countryCodes.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`Loaded ${this.countryCodes.length} country codes`);
    } catch (error) {
      console.error('Failed to load country codes:', error);
      this.countryCodes = [];
    }
  }

  // ============================================================================
  // FORM SETUP
  // ============================================================================

  setupForms() {
    const formElements = document.querySelectorAll('[ef-form-div]');
    
    formElements.forEach(form => {
      const formName = form.getAttribute('ef-form-div');
      const theme = form.getAttribute('ef-form-theme') || 'light';
      
      const formData = {
        element: form,
        name: formName,
        theme: theme,
        inputs: new Map(),
        submitBtn: form.querySelector('[ef-form-submit]'),
        interacted: new Set()
      };

      this.forms.set(formName, formData);
      this.setupCountryCodeSelects(formData);
      this.setupFormInputs(formData);
      this.setupSubmitButton(formData);
    });
  }

  setupCountryCodeSelects(formData) {
    const selects = formData.element.querySelectorAll('[ef-form-select="Country Code"]');
    
    selects.forEach(select => {
      select.innerHTML = '';
      
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Country';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);
      
      this.countryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.flag} ${country.name} ${country.dial_code}`;
        option.dataset.minLength = country.min_length;
        option.dataset.maxLength = country.max_length;
        option.dataset.country = country.name;
        option.dataset.iso2 = country.iso2;
        option.dataset.placeholder = country.placeholder;
        select.appendChild(option);
      });

      const phoneInput = this.findAssociatedPhoneInput(select);
      
      if (phoneInput) {
        select.dataset.phoneInputId = phoneInput.id;
        phoneInput.dataset.countrySelectId = select.id;

        select.addEventListener('change', () => {
          this.handleCountryCodeChange(select, phoneInput, formData);
        });

        this.syncSelectStyling(select, phoneInput);
      }
    });
  }

  findAssociatedPhoneInput(select) {
    const wrapper = select.closest('.code_div_wrap');
    if (wrapper) {
      const phoneInput = wrapper.querySelector('[ef-form-input="phone"]');
      if (phoneInput) return phoneInput;
    }

    const formInputWrap = select.closest('.form_input_wrap');
    if (formInputWrap) {
      const phoneInput = formInputWrap.querySelector('[ef-form-input="phone"]');
      if (phoneInput) return phoneInput;
    }

    let nextElement = select.nextElementSibling;
    while (nextElement) {
      if (nextElement.hasAttribute('ef-form-input') && nextElement.getAttribute('ef-form-input') === 'phone') {
        return nextElement;
      }
      nextElement = nextElement.nextElementSibling;
    }

    return null;
  }

  handleCountryCodeChange(select, phoneInput, formData) {
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.minLength && selectedOption.dataset.maxLength) {
      const minLength = parseInt(selectedOption.dataset.minLength);
      const maxLength = parseInt(selectedOption.dataset.maxLength);
      const placeholder = selectedOption.dataset.placeholder;
      
      phoneInput.dataset.minLength = minLength;
      phoneInput.dataset.maxLength = maxLength;
      phoneInput.setAttribute('maxlength', maxLength);
      
      if (placeholder) {
        phoneInput.setAttribute('placeholder', placeholder);
      }
      
      const inputData = formData.inputs.get(phoneInput);
      
      if (phoneInput.value.length > maxLength) {
        phoneInput.value = phoneInput.value.substring(0, maxLength);
      }

      if (inputData && inputData.hasInteracted) {
        this.validateInput(formData, inputData);
      }

      console.log(`Selected ${selectedOption.dataset.country}: ${minLength}-${maxLength} digits`);
    }

    this.syncSelectStyling(select, phoneInput);
  }

  syncSelectStyling(select, phoneInput) {
    if (!phoneInput) return;

    const hasBorderColor = phoneInput.hasAttribute('ef-bd');
    const hasBgColor = phoneInput.hasAttribute('ef-bg');

    if (hasBorderColor || hasBgColor) {
      const observer = new MutationObserver(() => {
        // Sync CSS classes instead of inline styles for Lumos override
        if (phoneInput.classList.contains('ef-valid')) {
          select.classList.add('ef-valid');
          select.classList.remove('ef-invalid');
        } else if (phoneInput.classList.contains('ef-invalid')) {
          select.classList.add('ef-invalid');
          select.classList.remove('ef-valid');
        }
      });

      observer.observe(phoneInput, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  // ============================================================================
  // INPUT SETUP & EVENT HANDLERS
  // ============================================================================

  setupFormInputs(formData) {
    const inputs = formData.element.querySelectorAll('[ef-form-input]');
    
    inputs.forEach(input => {
      const type = input.getAttribute('ef-form-input');
      const isRequired = input.hasAttribute('ef-data-required') && 
                        input.getAttribute('ef-data-required') === 'required';
      
      let wrapper = input.closest('.input_warning_wrap') || 
                    input.closest('.input_field_wrap') || 
                    input.closest('.form_input_wrap');
      
      if (!wrapper) {
        wrapper = input.parentElement;
      }
      
      let msgElement = null;
      if (wrapper) {
        msgElement = wrapper.querySelector('[ef-form-msg]');
        if (!msgElement) {
          const parentWrapper = wrapper.parentElement;
          if (parentWrapper) {
            msgElement = parentWrapper.querySelector('[ef-form-msg]');
          }
        }
      }
      
      const rightIndicator = wrapper?.querySelector('[ef-form-val="right"]');
      const wrongIndicator = wrapper?.querySelector('[ef-form-val="wrong"]');
      const hasBorderColor = input.hasAttribute('ef-bd');
      const hasBgColor = input.hasAttribute('ef-bg');

      if (msgElement) {
        msgElement.style.setProperty('display', 'none', 'important');
      }

      const inputData = {
        element: input,
        type: type,
        isRequired: isRequired,
        msgElement: msgElement,
        rightIndicator: rightIndicator,
        wrongIndicator: wrongIndicator,
        hasBorderColor: hasBorderColor,
        hasBgColor: hasBgColor,
        isValid: false,
        hasInteracted: false
      };

      formData.inputs.set(input, inputData);

      input.addEventListener('input', () => this.handleInput(formData, inputData));
      input.addEventListener('blur', () => this.handleBlur(formData, inputData));
      input.addEventListener('focus', () => this.handleFocus(formData, inputData));
      
      if (type === 'phone') {
        input.addEventListener('keypress', (e) => this.restrictToNumbers(e));
        input.addEventListener('paste', (e) => this.handlePhonePaste(e));
      }
    });
  }

  setupSubmitButton(formData) {
    if (!formData.submitBtn) return;

    formData.submitBtn.disabled = true;

    formData.submitBtn.addEventListener('click', (e) => {
      if (!this.isFormValid(formData)) {
        e.preventDefault();
        this.handleSubmit(formData);
      } else {
        console.log(`Form "${formData.name}" is valid - submitting...`);
      }
    });
  }

  handleInput(formData, inputData) {
    inputData.hasInteracted = true;
    this.validateInput(formData, inputData);
    this.updateSubmitButton(formData);
  }

  handleBlur(formData, inputData) {
    if (inputData.hasInteracted) {
      this.validateInput(formData, inputData);
    }
  }

  handleFocus(formData, inputData) {
    if (!inputData.hasInteracted) {
      inputData.hasInteracted = true;
    }
  }

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  validateInput(formData, inputData) {
    const value = inputData.element.value.trim();
    let isValid = true;
    let errorMsg = '';

    if (inputData.isRequired && value === '') {
      isValid = false;
      errorMsg = this.getDefaultErrorMessage(inputData);
    } else if (value !== '') {
      switch (inputData.type) {
        case 'plain':
          isValid = this.validatePlain(value);
          errorMsg = 'Only characters are allowed';
          break;
        
        case 'email':
          isValid = this.validateEmail(value);
          errorMsg = 'Please enter a valid email';
          break;
        
        case 'business email':
          const emailValidation = this.validateBusinessEmail(value);
          isValid = emailValidation.isValid;
          errorMsg = emailValidation.message;
          break;
        
        case 'phone':
          const phoneValidation = this.validatePhone(value, inputData.element);
          isValid = phoneValidation.isValid;
          errorMsg = phoneValidation.message;
          break;
      }
    } else if (!inputData.isRequired && value === '') {
      isValid = true;
    }

    inputData.isValid = isValid;
    this.updateUI(formData, inputData, isValid, errorMsg);
  }

  validatePlain(value) {
    return /^[a-zA-Z\s]+$/.test(value);
  }

  validateEmail(value) {
    return this.emailRegex.test(value);
  }

  validateBusinessEmail(value) {
    if (!this.emailRegex.test(value)) {
      return { isValid: false, message: 'Please enter a valid email' };
    }

    const domain = value.split('@')[1]?.toLowerCase();
    if (this.blockedDomains.includes(domain)) {
      return { isValid: false, message: 'Enter a valid business email' };
    }

    return { isValid: true, message: '' };
  }

  validatePhone(value, phoneInput) {
    const digitsOnly = value.replace(/\D/g, '');
    
    if (!/^[\d+\-\s()]+$/.test(value)) {
      return { isValid: false, message: 'Only numbers and symbols (+, -, space, parentheses) allowed' };
    }

    if (digitsOnly.length === 0) {
      return { isValid: false, message: 'Please enter phone number' };
    }

    const minLength = phoneInput.dataset.minLength;
    const maxLength = phoneInput.dataset.maxLength;
    
    if (minLength && maxLength) {
      const min = parseInt(minLength);
      const max = parseInt(maxLength);
      
      if (digitsOnly.length < min) {
        if (min === max) {
          return { isValid: false, message: `Please enter ${min} digits` };
        } else {
          return { isValid: false, message: `Please enter ${min}-${max} digits` };
        }
      }
      
      if (digitsOnly.length > max) {
        if (min === max) {
          return { isValid: false, message: `Please enter ${max} digits` };
        } else {
          return { isValid: false, message: `Please enter ${min}-${max} digits` };
        }
      }
    } else {
      if (digitsOnly.length < 5) {
        return { isValid: false, message: 'Please select country code first' };
      }
    }

    return { isValid: true, message: '' };
  }

  restrictToNumbers(e) {
    const charCode = e.which ? e.which : e.keyCode;
    const char = String.fromCharCode(charCode);
    
    if ([8, 9, 27, 13, 46].includes(charCode)) {
      return;
    }
    
    if (!/[\d+\-\s()]/.test(char)) {
      e.preventDefault();
    }
  }

  handlePhonePaste(e) {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const allowedChars = pastedText.replace(/[^\d+\-\s()]/g, '');
    
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;
    
    input.value = currentValue.substring(0, start) + allowedChars + currentValue.substring(end);
    input.setSelectionRange(start + allowedChars.length, start + allowedChars.length);
    
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ==============================
  // ONLY CHANGE IS HERE
  // ==============================
  getDefaultErrorMessage(inputData) {
    let placeholder = inputData.element.getAttribute('placeholder') || 'this field';

    // Prevent "Enter Enter" duplication
    placeholder = placeholder.replace(/^enter\s+(your\s+)?/i, '');

    return `Please enter ${placeholder}`;
  }

  // ============================================================================
  // UI UPDATES (with Lumos overrides via CSS classes + !important inline)
  // ============================================================================

  updateUI(formData, inputData, isValid, errorMsg) {
    const { rightIndicator, wrongIndicator, msgElement, element, hasBorderColor, hasBgColor, hasInteracted } = inputData;

    if (!hasInteracted) return;

    // --- Toggle CSS classes for Lumos override specificity ---
    if (isValid) {
      element.classList.add('ef-valid');
      element.classList.remove('ef-invalid');
    } else {
      element.classList.add('ef-invalid');
      element.classList.remove('ef-valid');
    }

    // --- Indicators ---
    if (rightIndicator) {
      rightIndicator.style.setProperty('display', isValid ? 'flex' : 'none', 'important');
    }
    if (wrongIndicator) {
      wrongIndicator.style.setProperty('display', isValid ? 'none' : 'flex', 'important');
    }

    // --- Error message ---
    if (msgElement) {
      if (!isValid && errorMsg) {
        msgElement.style.setProperty('display', 'block', 'important');
        msgElement.style.setProperty('visibility', 'visible', 'important');
        msgElement.style.setProperty('opacity', '1', 'important');
        msgElement.textContent = errorMsg;
      } else {
        msgElement.style.setProperty('display', 'none', 'important');
      }
    }

    // --- Border color (inline !important as fallback alongside CSS class) ---
    if (hasBorderColor) {
      const colors = this.getValidationColors(formData.theme);
      element.style.setProperty('border-color', isValid ? colors.borderRight : colors.borderWrong, 'important');
    }

    // --- Background color ---
    if (hasBgColor) {
      const colors = this.getValidationColors(formData.theme);
      element.style.setProperty('background-color', isValid ? colors.bgRight : colors.bgWrong, 'important');
    }

    // --- Sync country code select styling ---
    if (inputData.type === 'phone' && element.dataset.countrySelectId) {
      const select = document.getElementById(element.dataset.countrySelectId);
      if (select) {
        if (isValid) {
          select.classList.add('ef-valid');
          select.classList.remove('ef-invalid');
        } else {
          select.classList.add('ef-invalid');
          select.classList.remove('ef-valid');
        }

        if (hasBorderColor) {
          select.style.setProperty('border-color', element.style.borderColor, 'important');
        }
        if (hasBgColor) {
          select.style.setProperty('background-color', element.style.backgroundColor, 'important');
        }
      }
    }
  }

  getValidationColors(theme) {
    if (theme === 'dark') {
      return {
        borderRight: '#00a86b',
        borderWrong: '#e41e41',
        bgRight: '#3a795e',
        bgWrong: '#9c0f31'
      };
    } else {
      return {
        borderRight: '#00A86B',
        borderWrong: '#E2062C',
        bgRight: '#cadcac',
        bgWrong: '#F6ADC6'
      };
    }
  }

  // ============================================================================
  // FORM STATE
  // ============================================================================

  isFormValid(formData) {
    let allValid = true;

    formData.inputs.forEach((inputData) => {
      if (inputData.isRequired) {
        const value = inputData.element.value.trim();
        if (value === '' || !inputData.isValid) {
          allValid = false;
        }
      }
    });

    return allValid;
  }

  updateSubmitButton(formData) {
    if (!formData.submitBtn) return;

    const isValid = this.isFormValid(formData);
    formData.submitBtn.disabled = !isValid;
  }

  handleSubmit(formData) {
    let hasErrors = false;

    formData.inputs.forEach((inputData) => {
      if (inputData.isRequired) {
        inputData.hasInteracted = true;
        this.validateInput(formData, inputData);
        
        if (!inputData.isValid) {
          hasErrors = true;
        }
      }
    });

    if (!hasErrors) {
      console.log(`Form "${formData.name}" is valid and ready to submit`);
    } else {
      console.log(`Form "${formData.name}" has validation errors`);
    }
  }

  validateForm(formName) {
    const formData = this.forms.get(formName);
    if (formData) {
      this.handleSubmit(formData);
    }
  }

  resetForm(formName) {
    const formData = this.forms.get(formName);
    if (!formData) return;

    formData.inputs.forEach((inputData) => {
      inputData.element.value = '';
      inputData.isValid = false;
      inputData.hasInteracted = false;
      
      if (inputData.type === 'phone') {
        delete inputData.element.dataset.minLength;
        delete inputData.element.dataset.maxLength;
      }

      // Remove validation classes
      inputData.element.classList.remove('ef-valid', 'ef-invalid');
      
      if (inputData.rightIndicator) inputData.rightIndicator.style.setProperty('display', 'none', 'important');
      if (inputData.wrongIndicator) wrongIndicator.style.setProperty('display', 'none', 'important');
      if (inputData.msgElement) inputData.msgElement.style.setProperty('display', 'none', 'important');
      
      if (inputData.hasBorderColor) inputData.element.style.removeProperty('border-color');
      if (inputData.hasBgColor) inputData.element.style.removeProperty('background-color');
    });

    const selects = formData.element.querySelectorAll('[ef-form-select="Country Code"]');
    selects.forEach(select => {
      select.selectedIndex = 0;
      select.classList.remove('ef-valid', 'ef-invalid');
      select.style.removeProperty('border-color');
      select.style.removeProperty('background-color');
    });

    this.updateSubmitButton(formData);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.formValidator = new FormValidator();
  });
} else {
  window.formValidator = new FormValidator();
}
