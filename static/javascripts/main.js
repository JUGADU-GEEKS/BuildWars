document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Navbar scroll behavior
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    
    // Scroll down button
    const scrollDownBtn = document.getElementById('scroll-down');
    const queryFormSection = document.getElementById('query-form');
    
    scrollDownBtn.addEventListener('click', () => {
      queryFormSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Get started button
    const getStartedBtn = document.getElementById('get-started-btn');
    getStartedBtn.addEventListener('click', () => {
      queryFormSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Query input and department suggestion
    const queryInput = document.getElementById('query');
    const departmentContainer = document.getElementById('department-container');
    let selectedDepartment = null;
    
    queryInput.addEventListener('input', function() {
      const query = this.value;
      
      if (query.length > 20) {
        const suggestedDepartments = suggestDepartment(query);
        
        if (suggestedDepartments.length > 0) {
          renderDepartments(suggestedDepartments);
          departmentContainer.classList.add('active');
        } else {
          departmentContainer.classList.remove('active');
        }
      } else {
        departmentContainer.classList.remove('active');
      }
      
      validateForm();
    });
    
    // Render suggested departments
    function renderDepartments(departments) {
      departmentContainer.innerHTML = `
        <h3>Recommended Departments</h3>
        <div class="departments-grid"></div>
      `;
      
      const departmentsGrid = departmentContainer.querySelector('.departments-grid');
      
      departments.forEach(dept => {
        const isSelected = selectedDepartment && selectedDepartment.id === dept.id;
        
        const deptElement = document.createElement('div');
        deptElement.className = `department-card ${isSelected ? 'selected' : ''}`;
        deptElement.dataset.id = dept.id;
        deptElement.innerHTML = `
          <div class="department-card-content">
            <div class="department-info">
              <h4 class="department-name">${dept.name}</h4>
              <p class="department-description">${dept.description}</p>
            </div>
            <div class="check-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
        `;
        
        deptElement.addEventListener('click', () => {
          const deptCards = document.querySelectorAll('.department-card');
          deptCards.forEach(card => card.classList.remove('selected'));
          deptElement.classList.add('selected');
          selectedDepartment = dept;
          validateForm();
        });
        
        departmentsGrid.appendChild(deptElement);
      });
    }
    
    // Form validation
    const nameInput = document.getElementById('name');
    const addressInput = document.getElementById('address');
    const generateBtn = document.getElementById('generate-btn');
    const rtiForm = document.getElementById('rti-form');
    const rtiPreviewModal = document.getElementById('rti-preview-modal');
    const rtiContent = document.getElementById('rti-content');
    let loadingIndicator;
    let recommendedDeptDiv;

    // Create recommended department div
    function createRecommendedDeptSection() {
        if (!recommendedDeptDiv) {
            recommendedDeptDiv = document.createElement('div');
            recommendedDeptDiv.className = 'recommended-department';
            recommendedDeptDiv.style.marginTop = '20px';
            recommendedDeptDiv.style.padding = '15px';
            recommendedDeptDiv.style.borderRadius = '8px';
            recommendedDeptDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            recommendedDeptDiv.style.display = 'none';
            rtiForm.appendChild(recommendedDeptDiv);
        }
    }

    // Create loading indicator
    function createLoadingIndicator() {
        loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Generating RTI Application...';
        loadingIndicator.style.display = 'none';
        rtiForm.appendChild(loadingIndicator);
    }

    createLoadingIndicator();
    createRecommendedDeptSection();

    function validateForm() {
        const query = queryInput.value.trim();
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();
        
        if (query && name && address) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    nameInput.addEventListener('input', validateForm);
    addressInput.addEventListener('input', validateForm);
    queryInput.addEventListener('input', validateForm);

    // Form submission
    rtiForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const query = queryInput.value.trim();
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();

        if (!query || !name || !address) {
            showError('Please fill in all fields');
            return;
        }

        try {
            // Show loading state
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Generating...
            `;
            loadingIndicator.style.display = 'block';
            recommendedDeptDiv.style.display = 'none';
            
            // Clear any previous errors
            clearError();

            console.log('Starting RTI generation for query:', query);
            
            // Generate the RTI letter
            const rtiLetter = await window.rtiGeneration.generateEnhancedRTILetter(query, name, address);
            
            // Get the department info from the last API call
            const deptInfo = await window.rtiGeneration.getLastPredictedDepartment();
            
            // Show the recommended department
            if (deptInfo) {
                recommendedDeptDiv.innerHTML = `
                    <h3 style="color: #66B2FF; margin: 0 0 10px 0;">Recommended Department</h3>
                    <div style="color: #FFFFFF;">
                        <p style="font-weight: bold; margin: 0 0 5px 0;">${deptInfo.name}</p>
                        <p style="font-size: 0.9em; margin: 0; opacity: 0.8;">${deptInfo.description}</p>
                    </div>
                `;
                recommendedDeptDiv.style.display = 'block';
            }

            // Update modal content and show it
            rtiContent.textContent = rtiLetter;
            rtiPreviewModal.classList.add('active');
            console.log('Successfully generated RTI');
        } catch (error) {
            console.error('Detailed error in form submission:', error);
            showError(error.message);
        } finally {
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                    <path d="M22 2 11 13"/>
                </svg>
                Generate RTI Application
            `;
            loadingIndicator.style.display = 'none';
        }
    });

    function showError(message) {
        const errorDiv = document.querySelector('.error-message') || document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.backgroundColor = '#ff4444';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.marginTop = '10px';
        errorDiv.textContent = message;
        
        if (!document.querySelector('.error-message')) {
            rtiForm.appendChild(errorDiv);
        }
    }

    function clearError() {
        const errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Modal actions
    const closeModalBtn = document.getElementById('close-modal-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    closeModalBtn.addEventListener('click', () => {
      rtiPreviewModal.classList.remove('active');
    });
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(rtiContent.textContent)
        .then(() => {
          showToast('RTI application copied to clipboard');
        })
        .catch(() => {
          showToast('Failed to copy to clipboard', 'error');
        });
    });
    
    downloadBtn.addEventListener('click', () => {
      const text = rtiContent.textContent;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rti_application.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('RTI application downloaded');
    });
    
    // Close modal when clicking outside
    rtiPreviewModal.addEventListener('click', function(event) {
      if (event.target === this) {
        this.classList.remove('active');
      }
    });
    
    // Example categories
    const exampleCategories = document.getElementById('example-categories');
    
    function renderExampleCategories() {
      const categories = [...new Set(rtiExamples.map(ex => ex.category))];
      
      categories.forEach((category, index) => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'example-category glass-card';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
          <h3 class="category-title">${category}</h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        
        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content';
        
        // Default first category to be open
        if (index === 0) {
          categoryContent.classList.add('active');
          categoryHeader.querySelector('.chevron-icon').innerHTML = `
            <polyline points="6 9 12 15 18 9"></polyline>
          `;
        }
        
        // Add examples for this category
        const categoryExamples = rtiExamples.filter(ex => ex.category === category);
        
        categoryExamples.forEach(example => {
          const exampleItem = document.createElement('div');
          exampleItem.className = 'example-item';
          exampleItem.innerHTML = `
            <h4 class="example-title">${example.title}</h4>
            <p class="example-content">${example.content}</p>
            <div class="example-footer">
              <span class="example-department">${example.department}</span>
              <button class="btn-outline use-example-btn">Use this example</button>
            </div>
          `;
          
          // Use example button
          const useExampleBtn = exampleItem.querySelector('.use-example-btn');
          useExampleBtn.addEventListener('click', () => {
            queryInput.value = example.content;
            queryInput.dispatchEvent(new Event('input'));
            queryFormSection.scrollIntoView({ behavior: 'smooth' });
          });
          
          categoryContent.appendChild(exampleItem);
        });
        
        // Toggle category content
        categoryHeader.addEventListener('click', () => {
          const chevron = categoryHeader.querySelector('.chevron-icon');
          categoryContent.classList.toggle('active');
          
          if (categoryContent.classList.contains('active')) {
            chevron.innerHTML = `
              <polyline points="6 9 12 15 18 9"></polyline>
            `;
          } else {
            chevron.innerHTML = `
              <polyline points="9 18 15 12 9 6"></polyline>
            `;
          }
        });
        
        categoryElement.appendChild(categoryHeader);
        categoryElement.appendChild(categoryContent);
        exampleCategories.appendChild(categoryElement);
      });
    }
    
    renderExampleCategories();
    
    // Toast notifications
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      // Force reflow before adding the active class
      toast.offsetHeight;
      
      toast.classList.add('active');
      
      setTimeout(() => {
        toast.classList.remove('active');
        
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  });