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
        silver: { name: 'Silver Card', description: 'Great rewards and benefits.', incomeReq: 50000, creditLimit: 15000, benefits: '<li>3% cashback on groceries and gas</li><li>Travel insurance included</li><li>$50 annual fee</li>' },
        gold: { name: 'Gold Card', description: 'Premium perks for the discerning customer.', incomeReq: 80000, creditLimit: 30000, benefits: '<li>5% cashback on travel and dining</li><li>Airport lounge access</li><li>24/7 concierge service</li><li>$150 annual fee</li>' }
    };
    
    // Ordered list of screens for progress bar logic
    const screenOrder = [
        'welcome-screen', 'consent-screen', 'product-select-screen', 
        'qualification-screen', 'debt-screen', 'kyc-screen', 'doc-upload-screen', 'finish-screen'
    ];


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
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // --- VALIDATION FUNCTIONS ---
    const validateName = (name) => /^[a-zA-Z'-]+$/.test(String(name).trim());
    
    const validateAge = () => {
        const dob = new Date(kycDobInput.value);
        if (isNaN(dob.getTime())) return false;
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return dob <= eighteenYearsAgo && dob.getFullYear() > 1900;
    };

    const validateAddress = () => kycAddressInput.value.length >= 10 && /[0-9]/.test(kycAddressInput.value);
    
    const validateFile = (fileInput) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const minFileSize = 10240; // 10 KB
        const maxFileSize = 5242880; // 5 MB
        const file = fileInput.files[0];
        if (!file) return false;
        return allowedTypes.includes(file.type) && file.size > minFileSize && file.size < maxFileSize;
    };

    // --- HELPER FUNCTIONS ---
    const updateProgressBar = (currentScreenId) => {
        // Find the index of the current screen. Handle special cases like success/failure screens.
        let screenIndex = screenOrder.indexOf(currentScreenId);

        // Treat detail/success/failure screens as part of their preceding step for progress
        if (currentScreenId === 'product-detail-screen') screenIndex = screenOrder.indexOf('product-select-screen');
        if (currentScreenId === 'kyc-success-screen' || currentScreenId === 'kyc-failure-screen') screenIndex = screenOrder.indexOf('kyc-screen');

        const totalSteps = screenOrder.length - 1; // Don't count welcome screen as a step
        const progressPercentage = (screenIndex / totalSteps) * 100;

        progressBar.style.width = `${progressPercentage}%`;
        
        if(screenIndex < totalSteps) {
            progressText.textContent = `Step ${screenIndex + 1} of ${totalSteps}`;
        } else {
            progressText.textContent = 'Application Complete!';
            progressBar.style.width = '100%';
        }
    };

    const showScreen = (screenId) => {
        screens.forEach(screen => screen.classList.add('hidden'));
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.remove('hidden');
            updateProgressBar(screenId);
        }
    };

    const populateProducts = () => {
        productListDiv.innerHTML = '';
        Object.keys(productInfo).forEach(key => {
            const product = productInfo[key];
            const card = document.createElement('div');
            card.className = 'product-card border-2 border-slate-200 p-4 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition';
            card.dataset.productId = key;
            card.innerHTML = `
                <h3 class="font-bold text-slate-800">${product.name}</h3>
                <p class="text-sm text-slate-600">${product.description}</p>
            `;
            card.addEventListener('click', () => selectProduct(key));
            productListDiv.appendChild(card);
        });
    };

    const selectProduct = (productId) => {
        applicationData.selectedProduct = productId;
        const product = productInfo[productId];
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected', 'border-blue-500', 'ring-2', 'ring-blue-500');
            card.classList.add('border-slate-200');
        });
        const selectedCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        selectedCard.classList.add('selected', 'border-blue-500', 'ring-2', 'ring-blue-500');
        selectedCard.classList.remove('border-slate-200');
        
        productSummaryDiv.innerHTML = `<strong>Selected: ${product.name}</strong>`;
        productSelectNextBtn.disabled = false;
    };
    
    // --- DYNAMIC VALIDATION ---
    const checkKycForm = () => {
        const isFirstNameValid = validateName(kycFirstNameInput.value);
        firstNameError.textContent = kycFirstNameInput.value && !isFirstNameValid ? 'Please enter a valid first name.' : '';
        
        const isLastNameValid = validateName(kycLastNameInput.value);
        lastNameError.textContent = kycLastNameInput.value && !isLastNameValid ? 'Please enter a valid last name.' : '';
        
        const isAgeValid = validateAge();
        dobError.textContent = kycDobInput.value && !isAgeValid ? 'You must be over 18.' : '';

        const isAddressValid = validateAddress();
        addressError.textContent = kycAddressInput.value && !isAddressValid ? 'Please enter a valid address.' : '';
        
        const allFilled = [...kycForm.querySelectorAll('input')].every(input => input.value.trim() !== '');
        const allValid = isFirstNameValid && isLastNameValid && isAgeValid && isAddressValid;

        kycNextBtn.disabled = !(allFilled && allValid);
    };

    const checkUploadForm = () => {
        const isLicenceValid = validateFile(driversLicenceInput);
        licenceError.textContent = driversLicenceInput.files.length > 0 && !isLicenceValid ? 'Invalid file. Must be JPG, PNG, or PDF (10KB-5MB).' : '';

        const isStatementValid = validateFile(bankStatementInput);
        statementError.textContent = bankStatementInput.files.length > 0 && !isStatementValid ? 'Invalid file. Must be JPG, PNG, or PDF (10KB-5MB).' : '';

        docUploadNextBtn.disabled = !(isLicenceValid && isStatementValid);
    };

    // --- EVENT LISTENERS ---
    kycForm.addEventListener('input', checkKycForm);
    uploadForm.addEventListener('change', checkUploadForm);
    
    welcomeNextBtn.addEventListener('click', () => showScreen('consent-screen'));
    consentCheckbox.addEventListener('change', () => consentNextBtn.disabled = !consentCheckbox.checked);
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
            incomeErrorEl.textContent = `Sorry, you do not meet the minimum income requirement of $${requiredIncome.toLocaleString()}.`;
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
        kycDobInput.max = `${yyyy}-${mm}-${dd}`;
        kycDobInput.min = '1900-01-01';
    };

    populateProducts();
    setDobDateConstraints();
    showScreen('welcome-screen');
});
