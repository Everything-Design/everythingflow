
// ============================================================================
// ATTRIBUTE-BASED FORM VALIDATION SYSTEM WITH COUNTRY CODE SUPPORT
// ============================================================================
// Supports multiple forms on a single page with custom validation rules
// ============================================================================

class FormValidator {
  constructor() {
    this.forms = new Map();
    this.blockedDomains = [];
    this.countryCodes = [];
    this.emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    this.init();
  }

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
      if (inputData && inputData.msgElement) {
        if (minLength === maxLength) {
          inputData.msgElement.textContent = `Please enter ${minLength} digits`;
        } else {
          inputData.msgElement.textContent = `Please enter ${minLength}-${maxLength} digits`;
        }
      }
      
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
        if (hasBorderColor && phoneInput.style.borderColor) {
          select.style.borderColor = phoneInput.style.borderColor;
        }
        if (hasBgColor && phoneInput.style.backgroundColor) {
          select.style.backgroundColor = phoneInput.style.backgroundColor;
        }
      });

      observer.observe(phoneInput, {
        attributes: true,
        attributeFilter: ['style']
      });

      if (hasBorderColor && phoneInput.style.borderColor) {
        select.style.borderColor = phoneInput.style.borderColor;
      }
      if (hasBgColor && phoneInput.style.backgroundColor) {
        select.style.backgroundColor = phoneInput.style.backgroundColor;
      }
    }
  }

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
        msgElement.style.display = 'none';
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

  getDefaultErrorMessage(inputData) {
    const placeholder = inputData.element.getAttribute('placeholder') || 'this field';
    return `Please Enter ${placeholder}`;
  }

  updateUI(formData, inputData, isValid, errorMsg) {
    const { rightIndicator, wrongIndicator, msgElement, element, hasBorderColor, hasBgColor, hasInteracted } = inputData;

    if (!hasInteracted) return;

    if (rightIndicator) {
      rightIndicator.style.display = isValid ? 'flex' : 'none';
    }
    if (wrongIndicator) {
      wrongIndicator.style.display = isValid ? 'none' : 'flex';
    }

    if (msgElement) {
      if (!isValid && errorMsg) {
        msgElement.style.display = 'block';
        msgElement.style.visibility = 'visible';
        msgElement.style.opacity = '1';
        msgElement.textContent = errorMsg;
      } else {
        msgElement.style.display = 'none';
      }
    }

    if (hasBorderColor) {
      const colors = this.getValidationColors(formData.theme);
      element.style.borderColor = isValid ? colors.borderRight : colors.borderWrong;
    }

    if (hasBgColor) {
      const colors = this.getValidationColors(formData.theme);
      element.style.backgroundColor = isValid ? colors.bgRight : colors.bgWrong;
    }

    if (inputData.type === 'phone' && element.dataset.countrySelectId) {
      const select = document.getElementById(element.dataset.countrySelectId);
      if (select) {
        if (hasBorderColor) {
          select.style.borderColor = element.style.borderColor;
        }
        if (hasBgColor) {
          select.style.backgroundColor = element.style.backgroundColor;
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
      
      if (inputData.rightIndicator) inputData.rightIndicator.style.display = 'none';
      if (inputData.wrongIndicator) inputData.wrongIndicator.style.display = 'none';
      if (inputData.msgElement) inputData.msgElement.style.display = 'none';
      
      if (inputData.hasBorderColor) inputData.element.style.borderColor = '';
      if (inputData.hasBgColor) inputData.element.style.backgroundColor = '';
    });

    const selects = formData.element.querySelectorAll('[ef-form-select="Country Code"]');
    selects.forEach(select => {
      select.selectedIndex = 0;
      select.style.borderColor = '';
      select.style.backgroundColor = '';
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
