// ==========================================
// Mohamed Ramadan Portfolio - Admin Panel Script
// Powered by Supabase (real database + real file storage)
// ==========================================

(function () {
  'use strict';

  // ---- Supabase config ----
  const SUPABASE_URL = 'https://wmhxyweqpcklijenbixk.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtaHh5d2VxcGNrbGlqZW5iaXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjAxNDgsImV4cCI6MjA5ODYzNjE0OH0.uZvcMeF4Y3fhnpHviVqMEMf4Rk5t5SieXehUaVZRdf4';

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const BUCKET = 'uploads';

  // Default login credentials (client-side check only, matches previous behavior)
  const DEFAULT_USERNAME = 'admin';
  const DEFAULT_PASSWORD = '123456';

  let editingPortfolioId = null;
  let editingLinkId = null;
  let currentImageFile = null; // for gallery upload tab
  let currentPortfolioImageFile = null; // for portfolio modal upload

  // ==========================================
  // Login / Logout (session flag only, no data stored here anymore)
  // ==========================================
  window.handleLogin = function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      showDashboard();
    } else {
      errorEl.classList.add('show');
      setTimeout(() => errorEl.classList.remove('show'), 3000);
    }

    return false;
  };

  window.handleLogout = function () {
    sessionStorage.removeItem('adminLoggedIn');
    showLogin();
  };

  function checkLogin() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
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
    refreshAll();
  }

  async function refreshAll() {
    await Promise.all([
      updateStats(),
      renderPortfolioTable(),
      renderLinksTable(),
      renderGallery(),
      renderFilesList(),
      loadSettings(),
    ]);
  }

  // ==========================================
  // Navigation
  // ==========================================
  window.showSection = function (sectionName) {
    document.querySelectorAll('.admin-section').forEach((section) => {
      section.classList.add('section-hidden');
    });

    const selectedSection = document.getElementById('section-' + sectionName);
    if (selectedSection) {
      selectedSection.classList.remove('section-hidden');
    }

    document.querySelectorAll('.sidebar-nav a').forEach((link) => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(
      `.sidebar-nav a[data-section="${sectionName}"]`
    );
    if (activeLink) {
      activeLink.classList.add('active');
    }

    const titles = {
      dashboard: 'الرئيسية',
      portfolio: 'إدارة الأعمال',
      files: 'رفع الملفات',
      images: 'إدارة الصور',
      links: 'إدارة الروابط',
      settings: 'الإعدادات',
    };
    document.getElementById('pageTitle').textContent =
      titles[sectionName] || 'الرئيسية';

    if (window.innerWidth <= 992) {
      document.getElementById('sidebar').classList.remove('active');
    }
  };

  window.toggleSidebar = function () {
    document.getElementById('sidebar').classList.toggle('active');
  };

  // ==========================================
  // Stats
  // ==========================================
  async function updateStats() {
    const [portfolio, images, links, files] = await Promise.all([
      sb.from('portfolio_items').select('id', { count: 'exact', head: true }),
      sb.from('gallery_images').select('id', { count: 'exact', head: true }),
      sb.from('saved_links').select('id', { count: 'exact', head: true }),
      sb.from('uploaded_files').select('id', { count: 'exact', head: true }),
    ]);

    document.getElementById('statProjects').textContent = portfolio.count || 0;
    document.getElementById('statImages').textContent = images.count || 0;
    document.getElementById('statLinks').textContent = links.count || 0;
    document.getElementById('statFiles').textContent = files.count || 0;
  }

  // ==========================================
  // Helpers: storage upload
  // ==========================================
  async function uploadToStorage(file, folder) {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await sb.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw error;

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  // ==========================================
  // Portfolio Management
  // ==========================================
  window.openPortfolioModal = async function (itemId = null) {
    editingPortfolioId = itemId;
    currentPortfolioImageFile = null;
    const modal = document.getElementById('portfolioModal');
    const title = document.getElementById('portfolioModalTitle');
    const preview = document.getElementById('portfolioImagePreview');
    if (preview) {
      preview.classList.remove('show');
      preview.src = '';
    }

    if (itemId) {
      const { data: item, error } = await sb
        .from('portfolio_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!error && item) {
        title.textContent = 'تعديل عمل';
        document.getElementById('portfolioId').value = item.id;
        document.getElementById('portfolioTitleAr').value = item.title;
        document.getElementById('portfolioTitleEn').value = item.title_en;
        document.getElementById('portfolioCategory').value = item.category;
        document.getElementById('portfolioImageUrl').value = item.image_url;
        document.getElementById('portfolioLink').value =
          item.project_link || '';
        if (preview) {
          preview.src = item.image_url;
          preview.classList.add('show');
        }
      }
    } else {
      title.textContent = 'إضافة عمل جديد';
      document.getElementById('portfolioForm').reset();
      document.getElementById('portfolioId').value = '';
      document.getElementById('portfolioImageUrl').value = '';
    }

    modal.classList.add('active');
  };

  // Called when the user picks a file in the portfolio modal
  window.handlePortfolioImageSelect = function (input) {
    const preview = document.getElementById('portfolioImagePreview');
    if (input.files && input.files[0]) {
      currentPortfolioImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.classList.add('show');
      };
      reader.readAsDataURL(currentPortfolioImageFile);
    }
  };

  window.savePortfolioItem = async function (e) {
    e.preventDefault();

    const title = document.getElementById('portfolioTitleAr').value.trim();
    const titleEn = document.getElementById('portfolioTitleEn').value.trim();
    const category = document.getElementById('portfolioCategory').value;
    const link = document.getElementById('portfolioLink').value.trim() || null;
    let imageUrl = document.getElementById('portfolioImageUrl').value.trim();

    const saveBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جارِ الحفظ...';
    }

    try {
      if (currentPortfolioImageFile) {
        imageUrl = await uploadToStorage(currentPortfolioImageFile, 'portfolio');
      }

      if (!imageUrl) {
        showAlert('من فضلك اختر صورة للعمل', 'warning');
        return false;
      }

      const payload = {
        title,
        title_en: titleEn,
        category,
        image_url: imageUrl,
        project_link: link,
      };

      let error;
      if (editingPortfolioId) {
        ({ error } = await sb
          .from('portfolio_items')
          .update(payload)
          .eq('id', editingPortfolioId));
      } else {
        ({ error } = await sb.from('portfolio_items').insert(payload));
      }

      if (error) throw error;

      closeModal('portfolioModal');
      await renderPortfolioTable();
      await updateStats();
      editingPortfolioId = null;
      currentPortfolioImageFile = null;

      showAlert('تم حفظ العمل بنجاح!', 'success');
    } catch (err) {
      console.error(err);
      showAlert('حدث خطأ أثناء الحفظ: ' + err.message, 'danger');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
      }
    }

    return false;
  };

  window.deletePortfolioItem = async function (id) {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;

    const { error } = await sb.from('portfolio_items').delete().eq('id', id);
    if (error) {
      showAlert('حدث خطأ أثناء الحذف: ' + error.message, 'danger');
      return;
    }

    await renderPortfolioTable();
    await updateStats();
    showAlert('تم حذف العمل بنجاح!', 'success');
  };

  async function renderPortfolioTable() {
    const tbody = document.getElementById('portfolioTableBody');
    if (!tbody) return;

    const { data: items, error } = await sb
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (!items || items.length === 0) {
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

    tbody.innerHTML = items
      .map(
        (item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${item.image_url}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60x40?text=No+Image'"></td>
                <td>${item.title}</td>
                <td>${item.title_en}</td>
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
        `
      )
      .join('');
  }

  function getCategoryName(cat) {
    const names = {
      corporate: 'شركة',
      ecommerce: 'متجر',
      personal: 'شخصي',
      landing: 'هبوط',
      web: 'موقع',
      design: 'تصميم',
      app: 'تطبيق',
    };
    return names[cat] || cat;
  }

  function getCategoryColor(cat) {
    const colors = {
      corporate: '#0044cc',
      ecommerce: '#28a745',
      personal: '#ffc107',
      landing: '#ff6b6b',
      web: '#0044cc',
      design: '#28a745',
      app: '#ffc107',
    };
    return colors[cat] || '#666';
  }

  // ==========================================
  // Links Management
  // ==========================================
  window.openLinkModal = async function (linkId = null) {
    editingLinkId = linkId;
    const modal = document.getElementById('linkModal');
    const title = document.getElementById('linkModalTitle');

    if (linkId) {
      const { data: link, error } = await sb
        .from('saved_links')
        .select('*')
        .eq('id', linkId)
        .single();

      if (!error && link) {
        title.textContent = 'تعديل رابط';
        document.getElementById('linkId').value = link.id;
        document.getElementById('linkTitle').value = link.title;
        document.getElementById('linkUrl').value = link.url;
        document.getElementById('linkIcon').value =
          link.icon || 'fa-solid fa-globe';
      }
    } else {
      title.textContent = 'إضافة رابط';
      document.getElementById('linkForm').reset();
      document.getElementById('linkId').value = '';
    }

    modal.classList.add('active');
  };

  window.saveLink = async function (e) {
    e.preventDefault();

    const title = document.getElementById('linkTitle').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    const icon =
      document.getElementById('linkIcon').value.trim() || 'fa-solid fa-globe';

    const payload = { title, url, icon };

    let error;
    if (editingLinkId) {
      ({ error } = await sb
        .from('saved_links')
        .update(payload)
        .eq('id', editingLinkId));
    } else {
      ({ error } = await sb.from('saved_links').insert(payload));
    }

    if (error) {
      showAlert('حدث خطأ أثناء الحفظ: ' + error.message, 'danger');
      return false;
    }

    closeModal('linkModal');
    await renderLinksTable();
    await updateStats();
    editingLinkId = null;

    showAlert('تم حفظ الرابط بنجاح!', 'success');

    return false;
  };

  window.deleteLink = async function (id) {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;

    const { error } = await sb.from('saved_links').delete().eq('id', id);
    if (error) {
      showAlert('حدث خطأ أثناء الحذف: ' + error.message, 'danger');
      return;
    }

    await renderLinksTable();
    await updateStats();
    showAlert('تم حذف الرابط بنجاح!', 'success');
  };

  async function renderLinksTable() {
    const tbody = document.getElementById('linksTableBody');
    if (!tbody) return;

    const { data: links, error } = await sb
      .from('saved_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (!links || links.length === 0) {
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

    tbody.innerHTML = links
      .map(
        (link, index) => `
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
        `
      )
      .join('');
  }

  // ==========================================
  // Image Upload & Gallery
  // ==========================================
  window.handleImageUpload = function (input) {
    const preview = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
      currentImageFile = input.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.classList.add('show');
      };

      reader.readAsDataURL(currentImageFile);
    }
  };

  window.saveImage = async function () {
    if (!currentImageFile) {
      showAlert('الرجاء اختيار صورة أولاً', 'warning');
      return;
    }

    const name =
      document.getElementById('imageName').value.trim() ||
      'صورة ' + Date.now();

    try {
      const imageUrl = await uploadToStorage(currentImageFile, 'gallery');

      const { error } = await sb
        .from('gallery_images')
        .insert({ name, image_url: imageUrl });

      if (error) throw error;

      currentImageFile = null;
      document.getElementById('imageInput').value = '';
      document.getElementById('imageName').value = '';
      document.getElementById('imagePreview').classList.remove('show');

      await renderGallery();
      await updateStats();
      showAlert('تم رفع الصورة بنجاح!', 'success');
    } catch (err) {
      console.error(err);
      showAlert('حدث خطأ أثناء رفع الصورة: ' + err.message, 'danger');
    }
  };

  window.deleteImage = async function (id) {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    const { error } = await sb.from('gallery_images').delete().eq('id', id);
    if (error) {
      showAlert('حدث خطأ أثناء الحذف: ' + error.message, 'danger');
      return;
    }

    await renderGallery();
    await updateStats();
    showAlert('تم حذف الصورة بنجاح!', 'success');
  };

  async function renderGallery() {
    const gallery = document.getElementById('galleryGrid');
    if (!gallery) return;

    const { data: images, error } = await sb
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (!images || images.length === 0) {
      gallery.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-images"></i>
                    <p>لا توجد صور مرفوعة بعد</p>
                </div>
            `;
      return;
    }

    gallery.innerHTML = images
      .map(
        (img) => `
            <div style="background: #f8f9fa; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <img src="${img.image_url}" alt="${img.name}" style="width: 100%; height: 150px; object-fit: cover;">
                <div style="padding: 1rem;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">${img.name}</p>
                    <p style="font-size: 0.8rem; color: #666; margin-bottom: 0.5rem;">${new Date(img.created_at).toLocaleDateString('ar-EG')}</p>
                    <button class="btn-table btn-delete" onclick="deleteImage(${img.id})" style="width: 100%;">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `
      )
      .join('');
  }

  // ==========================================
  // File Upload
  // ==========================================
  window.handleFileUpload = async function (input) {
    if (!input.files || input.files.length === 0) return;

    for (const file of Array.from(input.files)) {
      try {
        const fileUrl = await uploadToStorage(file, 'files');

        const { error } = await sb.from('uploaded_files').insert({
          name: file.name,
          size: formatFileSize(file.size),
          file_url: fileUrl,
        });

        if (error) throw error;

        showAlert(`تم رفع الملف: ${file.name}`, 'success');
      } catch (err) {
        console.error(err);
        showAlert(`فشل رفع الملف ${file.name}: ${err.message}`, 'danger');
      }
    }

    await renderFilesList();
    await updateStats();
    input.value = '';
  };

  window.deleteFile = async function (id) {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

    const { error } = await sb.from('uploaded_files').delete().eq('id', id);
    if (error) {
      showAlert('حدث خطأ أثناء الحذف: ' + error.message, 'danger');
      return;
    }

    await renderFilesList();
    await updateStats();
    showAlert('تم حذف الملف بنجاح!', 'success');
  };

  window.downloadFile = function (url) {
    if (url) {
      window.open(url, '_blank');
    } else {
      showAlert('لا يمكن تحميل هذا الملف', 'warning');
    }
  };

  async function renderFilesList() {
    const container = document.getElementById('filesList');
    if (!container) return;

    const { data: files, error } = await sb
      .from('uploaded_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (!files || files.length === 0) {
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
                    ${files
                      .map(
                        (file, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td><i class="fa-solid fa-file" style="color: #0044cc; margin-left: 0.5rem;"></i> ${file.name}</td>
                            <td>${file.size}</td>
                            <td>${new Date(file.created_at).toLocaleDateString('ar-EG')}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-table btn-edit" onclick="downloadFile('${file.file_url}')" title="تحميل"><i class="fa-solid fa-download"></i></button>
                                    <button class="btn-table btn-delete" onclick="deleteFile(${file.id})" title="حذف"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    `
                      )
                      .join('')}
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
  async function loadSettings() {
    const { data: settings, error } = await sb
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !settings) return;

    const map = {
      siteTitle: 'site_title',
      siteEmail: 'site_email',
      sitePhone: 'site_phone',
      siteLocation: 'site_location',
      siteDescription: 'site_description',
      facebookLink: 'facebook_link',
      twitterLink: 'twitter_link',
      instagramLink: 'instagram_link',
      linkedinLink: 'linkedin_link',
      githubLink: 'github_link',
    };

    Object.entries(map).forEach(([elId, col]) => {
      const el = document.getElementById(elId);
      if (el && settings[col]) el.value = settings[col];
    });
  }

  window.saveSettings = async function (e) {
    e.preventDefault();

    const payload = {
      id: 1,
      site_title: document.getElementById('siteTitle').value,
      site_email: document.getElementById('siteEmail').value,
      site_phone: document.getElementById('sitePhone').value,
      site_location: document.getElementById('siteLocation').value,
      site_description: document.getElementById('siteDescription').value,
      facebook_link: document.getElementById('facebookLink').value,
      twitter_link: document.getElementById('twitterLink').value,
      instagram_link: document.getElementById('instagramLink').value,
      linkedin_link: document.getElementById('linkedinLink').value,
      github_link: document.getElementById('githubLink').value,
    };

    const { error } = await sb.from('site_settings').upsert(payload);

    if (error) {
      showAlert('حدث خطأ أثناء الحفظ: ' + error.message, 'danger');
      return false;
    }

    showAlert('تم حفظ الإعدادات بنجاح!', 'success');
    return false;
  };

  // ==========================================
  // Tabs
  // ==========================================
  window.switchTab = function (tabName) {
    document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
  };

  // ==========================================
  // Modal
  // ==========================================
  window.closeModal = function (modalId) {
    document.getElementById(modalId).classList.remove('active');
  };

  document.addEventListener('click', function (e) {
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
  document.addEventListener('DOMContentLoaded', function () {
    checkLogin();
  });
})();
