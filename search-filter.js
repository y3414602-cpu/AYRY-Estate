
/**
 * تحضير بيانات البحث من العقارات
 * نستخرج كل Titles الفريدة مع معلومات العقار
 */
function prepareSearchableData() {

    const searchableData = [];
    const uniqueValues = new Set();

    properties.forEach(prop => {

        const searchItems = [
            prop.governorate,
            prop.district,
            prop.area
        ];

        searchItems.forEach(item => {

            if (!uniqueValues.has(item)) {

                uniqueValues.add(item);

                searchableData.push({
                    label: item
                });

            }

        });

    });

    return searchableData;
}

const searchableData = prepareSearchableData();


// 2. State Management - إدارة حالة الفلاتر

let filterState = {
    selectedTitle: null,      // العنوان المختار من Autocomplete
    selectedBedrooms: [],     // أرقام الغرف المختارة (Array)
    selectedBathrooms: [],    // أرقام الحمامات المختارة (Array)
    selectedCategory: null,   // نوع العقار (Single select)
    maxPrice: Infinity        // الحد الأقصى للسعر (من Price Slider)
};

// 3. Autocomplete Search Function


/** 
 * 
 * @param {string} query - النص المكتوب في مربع البحث
 */
function handleSearchInput(query) {
    const searchTerm = query.toLowerCase().trim();
    const suggestionsBox = document.getElementById('autocomplete-suggestions');

    // إذا الحقل فارغ
    if (searchTerm === '') {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
        filterState.selectedTitle = null;
        applyAllFilters();
        return;
    }

    // فلترة البيانات
    const matches = searchableData.filter(item =>
        item.label.toLowerCase().includes(searchTerm)
    );

    // عرض النتائج
    displayAutocompleteSuggestions(matches, suggestionsBox);
}

/**
 * عرض نتائج Autocomplete في قائمة منسدلة
 * 
 * @param {array} matches - النتائج المطابقة
 * @param {element} container - عنصر HTML لعرض النتائج
 */
function displayAutocompleteSuggestions(matches, container) {
    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<div class="suggestion-empty">No Results!</div>';
        container.style.display = 'block';
        return;
    }

    matches.forEach(item => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion-item';
       suggestionDiv.innerHTML = `
          <span class="suggestion-title">${item.label}</span>
              `;

        // عند الضغط على اقتراح
        suggestionDiv.addEventListener('click', () => {
            selectTitleFromAutocomplete(item);
        });

        container.appendChild(suggestionDiv);
    });

    container.style.display = 'block';
}

/**
 * معالجة اختيار عنوان من Autocomplete
 * 
 * @param {object} item - العنصر المختار
 */
function selectTitleFromAutocomplete(item) {
    filterState.selectedTitle = item.label;
    document.getElementById('search-input').value = item.label;
    document.getElementById('autocomplete-suggestions').style.display = 'none';
    
    // تطبيق الفلاتر فوراً
    applyAllFilters();
}

// 4. Filter Toggle Functions - التحكم بالفلاتر


/**
 * إضافة أو حذف قيمة من مصفوفة الفلاتر (Bedrooms, Bathrooms)
 * 
 * @param {string} filterType - نوع الفلتر ('bedrooms' أو 'bathrooms')
 * @param {number} value - القيمة (رقم الغرف أو الحمامات)
 */
function toggleArrayFilter(filterType, value) {
    const index = filterState[`selected${capitalize(filterType)}`].indexOf(value);
    
    if (index === -1) {
        // أضف القيمة إذا لم تكن موجودة
        filterState[`selected${capitalize(filterType)}`].push(value);
    } else {
        // احذف القيمة إذا كانت موجودة
        filterState[`selected${capitalize(filterType)}`].splice(index, 1);
    }

    applyAllFilters();
}

/**
 * تعيين فلتر الفئة (Category)
 * 
 * @param {string} category - نوع العقار
 */
function setCategory(category) {
    // إذا نقرت على نفس الفئة المختارة → إلغاء الاختيار
    if (filterState.selectedCategory === category) {
        filterState.selectedCategory = null;
    } else {
        filterState.selectedCategory = category;
    }

    applyAllFilters();
}

/**
 * تعيين الحد الأقصى للسعر (من Price Slider)
 * 
 * @param {number} price - السعر الأقصى
 */
function setPriceFilter(price) {
    filterState.maxPrice = price;
    applyAllFilters();
}

// 5. Main Filtering Engine - محرك الفلترة الرئيسي


/**
 * تطبيق جميع الفلاتر معاً
 * هذه الدالة تجمع كل الشروط وترجع النتائج النهائية
 */
function applyAllFilters() {
    const filteredResults = properties.filter(prop => {
        // ✓ شرط 1: العنوان (Title)
       const matchesTitle =
                             !filterState.selectedTitle ||

                                   prop.governorate === filterState.selectedTitle ||
                                   prop.district === filterState.selectedTitle ||
                                   prop.area === filterState.selectedTitle;

        // ✓ شرط 2: الغرف (Bedrooms)
        const matchesBedrooms = filterState.selectedBedrooms.length === 0 || 
                                filterState.selectedBedrooms.includes(prop.bedrooms);

        // ✓ شرط 3: الحمامات (Bathrooms)
        const matchesBathrooms = filterState.selectedBathrooms.length === 0 || 
                                 filterState.selectedBathrooms.includes(prop.bathrooms);

        // ✓ شرط 4: النوع (Category)
        const matchesCategory = !filterState.selectedCategory || 
                                prop.category === filterState.selectedCategory;

        // ✓ شرط 5: السعر (Price)
        const matchesPrice = prop.price <= filterState.maxPrice;

        // العقار يجب أن يحقق جميع الشروط معاً
        return matchesTitle && matchesBedrooms && matchesBathrooms && 
               matchesCategory && matchesPrice;
    });

    // عرض النتائج أو رسالة "لا توجد نتائج"
    displayFilteredResults(filteredResults);
}

// 6. Display Functions - عرض النتائج


/**
 * عرض النتائج أو رسالة "لا توجد نتائج"
 * 
 * @param {array} results - النتائج المفلترة
 */
function displayFilteredResults(results) {
    const container = document.getElementById('properties-container');
    const noResultsDiv = document.getElementById('no-results-message');

    if (results.length === 0) {
        // عرض رسالة "لا توجد نتائج"
        container.innerHTML = '';
        container.style.display = 'none';
        
        noResultsDiv.style.display = 'block';
        noResultsDiv.innerHTML = `
            <div class="no-results-content">
                <h3>Sorry, no results found!</h3>
                <p>try:</p>
                <ul>
                    <li>1. Change search options</li>
                    <li>2. Reduce the maximum price</li>
                    <li>3. Choosing a different title</li>
                    <li>4. Remove some filters</li>
                </ul>
                <button onclick="resetAllFilters()" class="btn-reset">
                   Delete all filter
                </button>
            </div>
        `;
    } else {
        // عرض النتائج
        container.style.display = 'grid';
        noResultsDiv.style.display = 'none';
        
        container.innerHTML = results.map(prop => createPropertyCard(prop)).join('');
    }
}

/**
 * بناء كارت العقار
 * 
 * @param {object} prop - بيانات العقار
 * @returns {string} HTML للكارت
 */
function createPropertyCard(prop) {
    return `
        <div class="property-card">
            <img src="${prop.image}" alt="${prop.title}" class="property-image">
            <div class="property-content">
                <h3 class="property-title">${prop.title}</h3>
                <p class="property-location">
                    <i class="fa-solid fa-location-dot"></i> ${prop.governorate} / ${prop.district} / ${prop.area}
                </p>
                <p class="property-price">
                    <i class="fa-solid fa-sack-dollar"></i> ${prop.price.toLocaleString()} EGP
                </p>
                <div class="property-specs">
                    <span><i class="fa-solid fa-bed"></i> ${prop.bedrooms} bedroom</span>
                    <span><i class="fa-solid fa-bath"></i> ${prop.bathrooms} bathroom</span>
                    <span><i class="fa-solid fa-arrows-up-down-left-right"></i> ${prop.size} m²</span>
                </div>
                <p class="property-category">
                    ${prop.category} • ${prop.year} year
                </p>
            </div>
        </div>
    `;
}


// 7. Reset Function - إعادة تعيين الفلاتر


/**
 * إعادة تعيين جميع الفلاتر والعودة لعرض جميع العقارات
 */
function resetAllFilters() {
    // إعادة تعيين الحالة
    filterState = {
        selectedTitle: null,
        selectedBedrooms: [],
        selectedBathrooms: [],
        selectedCategory: null,
        maxPrice: Infinity
    };

    // إعادة تعيين عناصر HTML
    document.getElementById('search-input').value = '';
    document.getElementById('autocomplete-suggestions').innerHTML = '';
    document.getElementById('autocomplete-suggestions').style.display = 'none';

    // إزالة علامات من الـ Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    // إعادة تعيين Price Slider
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        priceSlider.value = 30000000; // القيمة القصوى
    }

    // تطبيق الفلاتر (ستعرض جميع العقارات)
    applyAllFilters();
}

// 8. Helper Functions - دوال مساعدة


/**
 * تحويل أول حرف لـ Uppercase
 * 
 * @param {string} str - النص
 * @returns {string} النص مع تكبير الحرف الأول
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * الحصول على قائمة الأرقام الفريدة لنوع معين
 * (مثلاً: الأرقام الفريدة للغرف من كل العقارات)
 * 
 * @param {string} field - اسم الحقل ('bedrooms' أو 'bathrooms')
 * @returns {array} مصفوفة الأرقام المرتبة
 */
function getUniqueValues(field) {
    const values = new Set(properties.map(prop => prop[field]));
    return Array.from(values).sort((a, b) => a - b);
}

/**
 * الحصول على جميع فئات العقارات الفريدة
 * 
 * @returns {array} مصفوفة الفئات
 */
function getUniqueCategories() {
    const categories = new Set(properties.map(prop => prop.category));
    return Array.from(categories);
}

// 9. Initialization - تهيئة النظام عند تحميل الصفحة


/**
 * تهيئة جميع Event Listeners
 * نادي هذه الدالة في onload أو DOMContentLoaded
 */
function initializeSearchAndFilters() {
    // 1. Autocomplete Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearchInput(e.target.value);
        });
    }

    // 2. Bedrooms Checkboxes
    const bedroomCheckboxes = document.querySelectorAll('[data-filter="bedrooms"]');
    bedroomCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            toggleArrayFilter('bedrooms', parseInt(e.target.value));
        });
    });

    // 3. Bathrooms Checkboxes
    const bathroomCheckboxes = document.querySelectorAll('[data-filter="bathrooms"]');
    bathroomCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            toggleArrayFilter('bathrooms', parseInt(e.target.value));
        });
    });

    // 4. Category Buttons
    const categoryButtons = document.querySelectorAll('[data-filter="category"]');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setCategory(e.target.dataset.category);
        });
    });

    // 5. Price Slider
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            setPriceFilter(parseInt(e.target.value));
            // تحديث عرض السعر (optional)
            const priceDisplay = document.getElementById('price-display');
            if (priceDisplay) {
                priceDisplay.textContent = `${parseInt(e.target.value).toLocaleString()} EGP`;
            }
        });
    }

    // 6. عرض النتائج الأولية
    applyAllFilters();
}

function createPropertyCard(prop) {
    return `
        <div class="property-card" onclick="goToPropertyDetails(${prop.id})" style="cursor:pointer;">
            <img src="${prop.image}" alt="${prop.title}" class="property-image">
            <div class="property-content">
                <h3 class="property-title">${prop.title}</h3>
                <p class="property-location">
                    <i class="fa-solid fa-location-dot"></i> ${prop.governorate} / ${prop.district} / ${prop.area}
                </p>
                <p class="property-price">
                    <i class="fa-solid fa-sack-dollar"></i> ${prop.price.toLocaleString()} EGP
                </p>
                <div class="property-specs">
                    <span><i class="fa-solid fa-bed"></i> ${prop.bedrooms} bedroom</span>
                    <span><i class="fa-solid fa-bath"></i> ${prop.bathrooms} bathroom</span>
                    <span><i class="fa-solid fa-arrows-up-down-left-right"></i> ${prop.size} m²</span>
                </div>
                <p class="property-category">
                    ${prop.category} • ${prop.year} year
                </p>
            </div>
        </div>
    `;
}

// استدعاء التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeSearchAndFilters);
