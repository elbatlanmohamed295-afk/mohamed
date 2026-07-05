// ==========================================
// Mohamed Ramadan Portfolio - Admin Panel Script (Updated)
// ==========================================

(function() {
    'use strict';

    // Default credentials
    const DEFAULT_USERNAME = 'admin';
    const DEFAULT_PASSWORD = '123456';

    let editingPortfolioId = null;
    let editingLinkId = null;

    // ==========================================
    // Login / Logout
    // ==========================================
    window.handleLogin = function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('loginError');

        if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUser', username);
            showDashboard();
        } else {
            errorEl.classList.add('show');
            setTimeout(() => errorEl.classList.remove('show'), 3000);
        }

        return false;
    };

    window.handleLogout = function() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUser');
        showLogin();
    };

    function checkLogin() {
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    function showDashboard() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        updateStats();
        renderPortfolioTable();
        renderLinksTable();
        renderGallery();
        renderFilesList();
        loadSettings();
    }

    // ==========================================
    // Navigation
    // ==========================================
    window.showSection = function(sectionName) {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('section-hidden');
        });

        const selectedSection = document.getElementById('section-' + sectionName);
        if (selectedSection) {
            selectedSection.classList.remove('section-hidden');
        }

        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`.sidebar-nav a[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        const titles = {
            'dashboard': 'الرئيسية',
            'portfolio': 'إدارة الأعمال',
            'files': 'رفع الملفات',
            'images': 'إدارة الصور',
            'links': 'إدارة الروابط',
            'settings': 'الإعدادات'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'الرئيسية';

        if (window.innerWidth <= 992) {
            document.getElementById('sidebar').classList.remove('active');
        }
    };

    window.toggleSidebar = function() {
        document.getElementById('sidebar').classList.toggle('active');
    };

    // ==========================================
    // Stats
    // ==========================================
    function updateStats() {
        const portfolio = JSON.parse(localStorage.getItem('portfolioItems')) || [];
        const images = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        const links = JSON.parse(localStorage.getItem('savedLinks')) || [];
        const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

        document.getElementById('statProjects').textContent = portfolio.length;
        document.getElementById('statImages').textContent = images.length;
        document.getElementById('statLinks').textContent = links.length;
        document.getElementById('statFiles').textContent = files.length;
    }

    // ==========================================
    // Portfolio Management
    // ==========================================
    window.openPortfolioModal = function(itemId = null) {
        editingPortfolioId = itemId;
        const modal = document.getElementById('portfolioModal');
        const title = document.getElementById('portfolioModalTitle');

        if (itemId) {
            const items = JSON.parse(localStorage.getItem('portfolioItems')) || [];
            const item = items.find(i => i.id === itemId);

            if (item) {
                title.textContent = 'تعديل عمل';
                document.getElementById('portfolioId').value = item.id;
                document.getElementById('portfolioTitleAr').value = item.title;
                document.getElementById('portfolioTitleEn').value = item.titleEn;
                document.getElementById('portfolioCategory').value = item.category;
                document.getElementById('portfolioImage').value = item.image;
                document.getElementById('portfolioLink').value = item.link || '';
            }
        } else {
            title.textContent = 'إضافة عمل جديد';
            document.getElementById('portfolioForm').reset();
            document.getElementById('portfolioId').value = '';
        }

        modal.classList.add('active');
    };

    window.savePortfolioItem = function(e) {
        e.preventDefault();

        const id = editingPortfolioId || Date.now();
        const title = document.getElementById('portfolioTitleAr').value.trim();
        const titleEn = document.getElementById('portfolioTitleEn').value.trim();
        const category = document.getElementById('portfolioCategory').value;
        const image = document.getElementById('portfolioImage').value.trim();
        const link = document.getElementById('portfolioLink').value.trim() || '#';

        let items = JSON.parse(localStorage.getItem('portfolioItems')) || [];

        if (editingPortfolioId) {
            const index = items.findIndex(i => i.id === editingPortfolioId);
            if (index !== -1) {
                items[index] = { id, title, titleEn, category, image, link };
            }
        } else {
            items.push({ id, title, titleEn, category, image, link });
        }

        localStorage.setItem('portfolioItems', JSON.stringify(items));

        closeModal('portfolioModal');
        renderPortfolioTable();
        updateStats();
        editingPortfolioId = null;

        showAlert('تم حفظ العمل بنجاح!', 'success');

        return false;
    };

    window.deletePortfolioItem = function(id) {
        if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;

        let items = JSON.parse(localStorage.getItem('portfolioItems')) || [];
        items = items.filter(i => i.id !== id);
        localStorage.setItem('portfolioItems', JSON.stringify(items));

        renderPortfolioTable();
        updateStats();
        showAlert('تم حذف العمل بنجاح!', 'success');
    };

    function renderPortfolioTable() {
        const tbody = document.getElementById('portfolioTableBody');
        const items = JSON.parse(localStorage.getItem('portfolioItems')) || [];

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <div class="empty-state">
                            <i class="fa-solid fa-folder-open"></i>
                            <p>لا توجد أعمال مضافة بعد</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60x40?text=No+Image'"></td>
                <td>${item.title}</td>
                <td>${item.titleEn}</td>
                <td>
                    <span style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.85rem; background: ${getCategoryColor(item.category)}; color: white;">
                        ${getCategoryName(item.category)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table btn-edit" onclick="openPortfolioModal(${item.id})" title="تعديل">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-table btn-delete" onclick="deletePortfolioItem(${item.id})" title="حذف">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function getCategoryName(cat) {
        const names = { 
            'corporate': 'شركة', 
            'ecommerce': 'متجر', 
            'personal': 'شخصي', 
            'landing': 'هبوط',
            'web': 'موقع',
            'design': 'تصميم',
            'app': 'تطبيق'
        };
        return names[cat] || cat;
    }

    function getCategoryColor(cat) {
        const colors = { 
            'corporate': '#0044cc', 
            'ecommerce': '#28a745', 
            'personal': '#ffc107', 
            'landing': '#ff6b6b',
            'web': '#0044cc',
            'design': '#28a745',
            'app': '#ffc107'
        };
        return colors[cat] || '#666';
    }

    // ==========================================
    // Links Management
    // ==========================================
    window.openLinkModal = function(linkId = null) {
        editingLinkId = linkId;
        const modal = document.getElementById('linkModal');
        const title = document.getElementById('linkModalTitle');

        if (linkId) {
            const links = JSON.parse(localStorage.getItem('savedLinks')) || [];
            const link = links.find(l => l.id === linkId);

            if (link) {
                title.textContent = 'تعديل رابط';
                document.getElementById('linkId').value = link.id;
                document.getElementById('linkTitle').value = link.title;
                document.getElementById('linkUrl').value = link.url;
                document.getElementById('linkIcon').value = link.icon || 'fa-solid fa-globe';
            }
        } else {
            title.textContent = 'إضافة رابط';
            document.getElementById('linkForm').reset();
            document.getElementById('linkId').value = '';
        }

        modal.classList.add('active');
    };

    window.saveLink = function(e) {
        e.preventDefault();

        const id = editingLinkId || Date.now();
        const title = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        const icon = document.getElementById('linkIcon').value.trim() || 'fa-solid fa-globe';

        let links = JSON.parse(localStorage.getItem('savedLinks')) || [];

        if (editingLinkId) {
            const index = links.findIndex(l => l.id === editingLinkId);
            if (index !== -1) {
                links[index] = { id, title, url, icon };
            }
        } else {
            links.push({ id, title, url, icon });
        }

        localStorage.setItem('savedLinks', JSON.stringify(links));

        closeModal('linkModal');
        renderLinksTable();
        updateStats();
        editingLinkId = null;

        showAlert('تم حفظ الرابط بنجاح!', 'success');

        return false;
    };

    window.deleteLink = function(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;

        let links = JSON.parse(localStorage.getItem('savedLinks')) || [];
        links = links.filter(l => l.id !== id);
        localStorage.setItem('savedLinks', JSON.stringify(links));

        renderLinksTable();
        updateStats();
        showAlert('تم حذف الرابط بنجاح!', 'success');
    };

    function renderLinksTable() {
        const tbody = document.getElementById('linksTableBody');
        const links = JSON.parse(localStorage.getItem('savedLinks')) || [];

        if (links.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem;">
                        <div class="empty-state">
                            <i class="fa-solid fa-link"></i>
                            <p>لا توجد روابط مضافة بعد</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = links.map((link, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><i class="${link.icon}"></i> ${link.title}</td>
                <td><a href="${link.url}" target="_blank" style="color: #0044cc;">${link.url}</a></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table btn-edit" onclick="openLinkModal(${link.id})" title="تعديل">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-table btn-delete" onclick="deleteLink(${link.id})" title="حذف">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ==========================================
    // Image Upload & Gallery
    // ==========================================
    let currentImageData = null;

    window.handleImageUpload = function(input) {
        const preview = document.getElementById('imagePreview');

        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function(e) {
                currentImageData = e.target.result;
                preview.src = currentImageData;
                preview.classList.add('show');
            };

            reader.readAsDataURL(input.files[0]);
        }
    };

    window.saveImage = function() {
        if (!currentImageData) {
            showAlert('الرجاء اختيار صورة أولاً', 'warning');
            return;
        }

        const name = document.getElementById('imageName').value.trim() || 'صورة ' + Date.now();

        let images = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        images.push({
            id: Date.now(),
            name: name,
            data: currentImageData,
            date: new Date().toLocaleDateString('ar-EG')
        });

        localStorage.setItem('uploadedImages', JSON.stringify(images));

        currentImageData = null;
        document.getElementById('imageInput').value = '';
        document.getElementById('imageName').value = '';
        document.getElementById('imagePreview').classList.remove('show');

        renderGallery();
        updateStats();
        showAlert('تم حفظ الصورة بنجاح!', 'success');
    };

    window.deleteImage = function(id) {
        if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

        let images = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        images = images.filter(img => img.id !== id);
        localStorage.setItem('uploadedImages', JSON.stringify(images));

        renderGallery();
        updateStats();
        showAlert('تم حذف الصورة بنجاح!', 'success');
    };

    function renderGallery() {
        const gallery = document.getElementById('galleryGrid');
        const images = JSON.parse(localStorage.getItem('uploadedImages')) || [];

        if (images.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-images"></i>
                    <p>لا توجد صور مرفوعة بعد</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = images.map(img => `
            <div style="background: #f8f9fa; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <img src="${img.data}" alt="${img.name}" style="width: 100%; height: 150px; object-fit: cover;">
                <div style="padding: 1rem;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">${img.name}</p>
                    <p style="font-size: 0.8rem; color: #666; margin-bottom: 0.5rem;">${img.date}</p>
                    <button class="btn-table btn-delete" onclick="deleteImage(${img.id})" style="width: 100%;">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // File Upload
    // ==========================================
    window.handleFileUpload = function(input) {
        if (!input.files || input.files.length === 0) return;

        let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

        Array.from(input.files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                files.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    data: e.target.result,
                    date: new Date().toLocaleDateString('ar-EG')
                });

                localStorage.setItem('uploadedFiles', JSON.stringify(files));
                renderFilesList();
                updateStats();
                showAlert(`تم رفع الملف: ${file.name}`, 'success');
            };

            if (file.size < 1024 * 1024) {
                reader.readAsDataURL(file);
            } else {
                files.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    data: null,
                    date: new Date().toLocaleDateString('ar-EG')
                });
                localStorage.setItem('uploadedFiles', JSON.stringify(files));
                renderFilesList();
                updateStats();
                showAlert(`تم رفع الملف: ${file.name} (كبير جداً للمعاينة)`, 'success');
            }
        });

        input.value = '';
    };

    window.deleteFile = function(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

        let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        files = files.filter(f => f.id !== id);
        localStorage.setItem('uploadedFiles', JSON.stringify(files));

        renderFilesList();
        updateStats();
        showAlert('تم حذف الملف بنجاح!', 'success');
    };

    window.downloadFile = function(id) {
        const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        const file = files.find(f => f.id === id);

        if (file && file.data) {
            const link = document.createElement('a');
            link.href = file.data;
            link.download = file.name;
            link.click();
        } else {
            showAlert('لا يمكن تحميل هذا الملف', 'warning');
        }
    };

    function renderFilesList() {
        const container = document.getElementById('filesList');
        const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

        if (files.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>لا توجد ملفات مرفوعة بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>اسم الملف</th>
                        <th>الحجم</th>
                        <th>التاريخ</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${files.map((file, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td><i class="fa-solid fa-file" style="color: #0044cc; margin-left: 0.5rem;"></i> ${file.name}</td>
                            <td>${file.size}</td>
                            <td>${file.date}</td>
                            <td>
                                <div class="table-actions">
                                    ${file.data ? `<button class="btn-table btn-edit" onclick="downloadFile(${file.id})" title="تحميل"><i class="fa-solid fa-download"></i></button>` : ''}
                                    <button class="btn-table btn-delete" onclick="deleteFile(${file.id})" title="حذف"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ==========================================
    // Settings
    // ==========================================
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('siteSettings')) || {};

        if (settings.siteTitle) document.getElementById('siteTitle').value = settings.siteTitle;
        if (settings.siteEmail) document.getElementById('siteEmail').value = settings.siteEmail;
        if (settings.sitePhone) document.getElementById('sitePhone').value = settings.sitePhone;
        if (settings.siteLocation) document.getElementById('siteLocation').value = settings.siteLocation;
        if (settings.siteDescription) document.getElementById('siteDescription').value = settings.siteDescription;
        if (settings.facebookLink) document.getElementById('facebookLink').value = settings.facebookLink;
        if (settings.twitterLink) document.getElementById('twitterLink').value = settings.twitterLink;
        if (settings.instagramLink) document.getElementById('instagramLink').value = settings.instagramLink;
        if (settings.linkedinLink) document.getElementById('linkedinLink').value = settings.linkedinLink;
        if (settings.githubLink) document.getElementById('githubLink').value = settings.githubLink;
    }

    window.saveSettings = function(e) {
        e.preventDefault();

        const settings = {
            siteTitle: document.getElementById('siteTitle').value,
            siteEmail: document.getElementById('siteEmail').value,
            sitePhone: document.getElementById('sitePhone').value,
            siteLocation: document.getElementById('siteLocation').value,
            siteDescription: document.getElementById('siteDescription').value,
            facebookLink: document.getElementById('facebookLink').value,
            twitterLink: document.getElementById('twitterLink').value,
            instagramLink: document.getElementById('instagramLink').value,
            linkedinLink: document.getElementById('linkedinLink').value,
            githubLink: document.getElementById('githubLink').value
        };

        localStorage.setItem('siteSettings', JSON.stringify(settings));
        showAlert('تم حفظ الإعدادات بنجاح!', 'success');

        return false;
    };

    // ==========================================
    // Tabs
    // ==========================================
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById('tab-' + tabName).classList.add('active');
    };

    // ==========================================
    // Modal
    // ==========================================
    window.closeModal = function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    };

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // ==========================================
    // Alerts
    // ==========================================
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'circle-exclamation' : 'triangle-exclamation'}"></i>
            ${message}
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(alertDiv, mainContent.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    // ==========================================
    // Initialize
    // ==========================================
    document.addEventListener('DOMContentLoaded', function() {
        checkLogin();
    });

})();
