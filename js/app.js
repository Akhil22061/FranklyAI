document.addEventListener('DOMContentLoaded', () => {
    // --- STATE AND DATA ---
    const applicationData = {
        selectedProduct: null,
        income: 0,
        debt: 0,
        kyc: {}
    };

    const productInfo = {
        basic: { name: 'Basic Card', description: 'A simple card for everyday use.', incomeReq: 30000, creditLimit: 5000, benefits: '<li>1% cashback on all purchases</li><li>No annual fee</li><li>Basic fraud protection</li>' },
        silver: { name: 'Silver Card', description: 'Great rewards and benefits for frequent shoppers.', incomeReq: 50000, creditLimit: 15000, benefits: '<li>3% cashback on groceries and gas</li><li>Travel insurance included</li><li>$50 annual fee</li>' },
        gold: { name: 'Gold Card', description: 'Premium perks for the discerning customer.', incomeReq: 80000, creditLimit: 30000, benefits: '<li>5% cashback on travel and dining</li><li>Airport lounge access</li><li>24/7 concierge service</li><li>$150 annual fee</li>' }
    };

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.screen');
    const backButtons = document.querySelectorAll('.back-btn');
    const welcomeNextBtn = document.getElementById('welcome-next-btn');
    const consentCheckbox = document.getElementById('consent-checkbox');
    const consentNextBtn = document.getElementById('consent-next-btn');
    const productListDiv = document.getElementById('product-list');
    const productSummaryDiv = document.getElementById('product-summary');
    const productSelectNextBtn = document.getElementById('product-select-next-btn');
    const detailTitle = document.getElementById('detail-title');
    const detailContent = document.getElementById('detail-content');
    const productDetailNextBtn = document.getElementById('product-detail-next-btn');
    const requiredIncomeEl = document.getElementById('required-income');
    const incomeInput = document.getElementById('income-input');
    const incomeErrorEl = document.getElementById('income-error');
    const qualificationNextBtn = document.getElementById('qualification-next-btn');
    const debtInput = document.getElementById('debt-input');
    const debtErrorEl = document.getElementById('debt-error');
    const debtNextBtn = document.getElementById('debt-next-btn');
    const kycForm = document.getElementById('kyc-form');
    const kycNextBtn = document.getElementById('kyc-next-btn');
    const kycFirstNameInput = document.getElementById('first-name');
    const kycLastNameInput = document.getElementById('last-name');
    const kycDobInput = document.getElementById('dob');
    const kycAddressInput = document.getElementById('address');
    const firstNameError = document.getElementById('first-name-error');
    const lastNameError = document.getElementById('last-name-error');
    const dobError = document.getElementById('dob-error');
    const addressError = document.getElementById('address-error');
    const kycSuccessNextBtn = document.getElementById('kyc-success-next-btn');
    const uploadForm = document.getElementById('upload-form');
    const driversLicenceInput = document.getElementById('drivers-licence');
    const bankStatementInput = document.getElementById('bank-statement');
    const docUploadNextBtn = document.getElementById('doc-upload-next-btn');
    const licenceError = document.getElementById('licence-error');
    const statementError = document.getElementById('statement-error');

    // --- VALIDATION FUNCTIONS ---
    
    const validateName = (name) => {
        const re = /^[a-zA-Z'-]+$/;
        return re.test(String(name).trim());
    };
    
    const validateAge = () => {
        const dob = new Date(kycDobInput.value);
        if (isNaN(dob.getTime())) return false;
        
        const year = dob.getFullYear();
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        if (year < 1900 || year >= 2025) return false;
        return dob <= eighteenYearsAgo;
    };

    const validateAddress = () => {
        const address = kycAddressInput.value;
        const hasNumber = /[0-9]/.test(address);
        return address.length >= 10 && hasNumber;
    };
    
    const validateFile = (fileInput) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const minFileSize = 10240; // 10 KB
        const maxFileSize = 5242880; // 5 MB
        const file = fileInput.files[0];
        if (!file) return false;
        
        const isTypeValid = allowedTypes.includes(file.type);
        const isSizeValid = file.size > minFileSize && file.size < maxFileSize;
        
        return isTypeValid && isSizeValid;
    };

    // --- HELPER FUNCTIONS ---
    const showScreen = (screenId) => {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    };

    const populateProducts = () => {
        productListDiv.innerHTML = '';
        Object.keys(productInfo).forEach(key => {
            const product = productInfo[key];
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = key;
            card.innerHTML = `<h3>${product.name}</h3><p>${product.description}</p>`;
            card.addEventListener('click', () => selectProduct(key));
            productListDiv.appendChild(card);
        });
    };

    const selectProduct = (productId) => {
        applicationData.selectedProduct = productId;
        const product = productInfo[productId];
        document.querySelectorAll('.product-card').forEach(card => card.classList.remove('selected'));
        document.querySelector(`.product-card[data-product-id="${productId}"]`).classList.add('selected');
        productSummaryDiv.innerHTML = `
            <strong>Selected: ${product.name}</strong><br>
            Income Requirement: $${product.incomeReq.toLocaleString()}<br>
            Credit Limit: Up to $${product.creditLimit.toLocaleString()}
        `;
        productSelectNextBtn.disabled = false;
        productSelectNextBtn.classList.remove('btn-disabled');
    };
    
    // --- EVENT LISTENERS AND DYNAMIC VALIDATION ---

    const checkKycForm = () => {
        let isFormValid = true;
        if (kycFirstNameInput.value && !validateName(kycFirstNameInput.value)) {
            firstNameError.textContent = 'Please enter a valid first name (letters only).';
            isFormValid = false;
        } else { firstNameError.textContent = ''; }

        if (kycLastNameInput.value && !validateName(kycLastNameInput.value)) {
            lastNameError.textContent = 'Please enter a valid last name (letters only).';
            isFormValid = false;
        } else { lastNameError.textContent = ''; }
        
        if (kycDobInput.value && !validateAge()) {
            dobError.textContent = 'Please enter a valid date (you must be over 18 and born after 1900).';
            isFormValid = false;
        } else { dobError.textContent = ''; }

        if (kycAddressInput.value && !validateAddress()) {
            addressError.textContent = 'Please enter a valid address (must be at least 10 characters and include a number).';
            isFormValid = false;
        } else { addressError.textContent = ''; }
        
        const allFilled = [...kycForm.querySelectorAll('input')].every(input => input.value.trim() !== '');
        if (!allFilled) { isFormValid = false; }
        
        kycNextBtn.disabled = !isFormValid;
        kycNextBtn.classList.toggle('btn-disabled', !isFormValid);
    };

    const checkUploadForm = () => {
        let isLicenceValid = false;
        if (driversLicenceInput.files.length > 0) {
            if (validateFile(driversLicenceInput)) {
                licenceError.textContent = '';
                isLicenceValid = true;
            } else {
                licenceError.textContent = 'Invalid file. Must be JPG, PNG, or PDF between 10 KB and 5 MB.';
            }
        }

        let isStatementValid = false;
        if (bankStatementInput.files.length > 0) {
            if (validateFile(bankStatementInput)) {
                statementError.textContent = '';
                isStatementValid = true;
            } else {
                statementError.textContent = 'Invalid file. Must be JPG, PNG, or PDF between 10 KB and 5 MB.';
            }
        }
        
        const isFormValid = isLicenceValid && isStatementValid;
        docUploadNextBtn.disabled = !isFormValid;
        docUploadNextBtn.classList.toggle('btn-disabled', !isFormValid);
    };

    kycForm.addEventListener('input', checkKycForm);
    uploadForm.addEventListener('change', checkUploadForm);
    
    welcomeNextBtn.addEventListener('click', () => showScreen('consent-screen'));
    consentCheckbox.addEventListener('change', () => {
        consentNextBtn.disabled = !consentCheckbox.checked;
        consentNextBtn.classList.toggle('btn-disabled', !consentCheckbox.checked);
    });
    consentNextBtn.addEventListener('click', () => showScreen('product-select-screen'));
    productSelectNextBtn.addEventListener('click', () => {
        const product = productInfo[applicationData.selectedProduct];
        detailTitle.innerText = product.name;
        detailContent.innerHTML = `<p>${product.description}</p><h4>Benefits:</h4><ul>${product.benefits}</ul><h4>Requirements:</h4><ul><li>Minimum Annual Income: $${product.incomeReq.toLocaleString()}</li><li>Credit Limit: Up to $${product.creditLimit.toLocaleString()}</li></ul>`;
        showScreen('product-detail-screen');
    });
    productDetailNextBtn.addEventListener('click', () => {
        const product = productInfo[applicationData.selectedProduct];
        requiredIncomeEl.textContent = `$${product.incomeReq.toLocaleString()}`;
        incomeErrorEl.textContent = '';
        showScreen('qualification-screen');
    });
    qualificationNextBtn.addEventListener('click', () => {
        const income = parseInt(incomeInput.value, 10);
        const requiredIncome = productInfo[applicationData.selectedProduct].incomeReq;
        if (isNaN(income) || income < requiredIncome) {
            incomeErrorEl.textContent = `Sorry, you do not meet the minimum income requirement of $${requiredIncome.toLocaleString()}. Please choose another product.`;
        } else {
            applicationData.income = income;
            incomeErrorEl.textContent = '';
            debtErrorEl.textContent = '';
            showScreen('debt-screen');
        }
    });
    debtNextBtn.addEventListener('click', () => {
        const debt = parseInt(debtInput.value, 10) || 0;
        if (debt >= 10000) {
            debtErrorEl.textContent = `Your debt of $${debt.toLocaleString()} is too high. The maximum allowed is $9,999.`;
        } else {
            applicationData.debt = debt;
            debtErrorEl.textContent = '';
            showScreen('kyc-screen');
        }
    });
    kycNextBtn.addEventListener('click', () => {
        if (kycFirstNameInput.value.toLowerCase().trim() === 'error') {
            showScreen('kyc-failure-screen');
        } else {
            showScreen('kyc-success-screen');
        }
    });
    kycSuccessNextBtn.addEventListener('click', () => showScreen('doc-upload-screen'));
    docUploadNextBtn.addEventListener('click', () => showScreen('finish-screen'));
    backButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.target)));

    // --- INITIALIZATION ---
    const setDobDateConstraints = () => {
        const today = new Date();
        const yyyy = today.getFullYear() - 18;
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        kycDobInput.min = '1900-01-01';
        kycDobInput.max = `${yyyy}-${mm}-${dd}`;
    };

    populateProducts();
    setDobDateConstraints();
    showScreen('welcome-screen');
});