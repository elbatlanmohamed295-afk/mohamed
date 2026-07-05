# 🚀 Mohamed Ramadan Portfolio - Vercel Ready

## 📦 ملفات جاهزة للرفع على Vercel

## ⚡ خطوات الرفع على Vercel (3 خطوات فقط)

### الخطوة 1: حمّل الملفات على GitHub
1. اعمل **New Repository** على GitHub
2. ارفع كل الملفات (بدون node_modules)

### الخطوة 2: ربط Vercel
1. سجل دخول على [vercel.com](https://vercel.com) بحساب GitHub
2. اضغط **"Add New Project"**
3. اختار الـ Repository
4. اضغط **"Deploy"**

### الخطوة 3: خلاص! 🎉
Vercel هيبني الموقع تلقائياً ويديك لينك

---

## 🔧 أو لو عايز تبني محلياً أولاً

```bash
# 1. نزل الملفات
# 2. افتح Terminal في المجلد

# 3. نزل الـ dependencies
npm install

# 4. شغل السيرفر المحلي
npm run dev

# 5. افتح المتصفح على
# http://localhost:3000

# 6. لبناء النسخة النهائية
npm run build

# 7. الناتج هيكون في مجلد dist/
```

---

## 📁 هيكل الملفات (Vite Structure)

```
mohamed-ramadan-portfolio/
│
├── index.html              ← نقطة الدخول (Vite)
├── package.json            ← Dependencies
├── vite.config.js          ← إعدادات Vite
├── vercel.json             ← إعدادات Vercel
│
├── src/
│   ├── css/
│   │   └── style.css       ← كل التنسيقات
│   └── js/
│       └── main.js         ← كل التفاعلات
│
├── public/                 ← Static files (ما بتتبنيش)
│   ├── images/
│   │   ├── logo.png
│   │   ├── profile.png
│   │   └── logo-small.png
│   ├── admin/              ← 🔐 لوحة التحكم
│   │   ├── index.html
│   │   ├── css/admin.css
│   │   └── js/admin.js
│   └── admin-login.html    ← صفحة دخول سهلة
│
└── README.md
```

---

## 🔐 دخول لوحة التحكم

### الطريقة 1: مباشرة
```
https://your-site.vercel.app/admin-login.html
```

### الطريقة 2: من الموقع
- انقر **مرتين** على اللوجو
- أو اضغط `Ctrl + Shift + A`

### بيانات الدخول
| البيان | القيمة |
|--------|--------|
| اسم المستخدم | `admin` |
| كلمة المرور | `123456` |

---

## 📞 بيانات التواصل في الموقع

| البيان | القيمة |
|--------|--------|
| 📧 الإيميل | elbatlanmohamed295@gmail.com |
| 📱 واتساب | +20 122 405 6162 |
| 💼 لينكد إن | linkedin.com/in/mohamed-ramadan-0a8958307 |
| 📘 فيسبوك | facebook.com/profile.php?id=100055721036528 |
| 📸 إنستجرام | instagram.com/m_o_ramadan |

---

## ⚠️ ملاحظات مهمة

1. **البيانات** تتحفظ في `localStorage` المتصفح
2. **الصور المرفوعة** تتحفظ كـ Base64 (حجمها محدود)
3. **غيّر الباسورد** في `public/admin/js/admin.js`
4. **للإنتاج الحقيقي** ربط Backend + قاعدة بيانات

---

## 🛠️ التقنيات المستخدمة

- **Vite 6** - Build tool
- **HTML5** - Structure
- **CSS3** - Styling & Animations
- **Vanilla JavaScript** - Interactivity
- **Font Awesome 7** - Icons
- **Google Fonts** - Cairo & Fira Code

---

**تم الإنشاء بواسطة:** محمد رمضان
**التاريخ:** 2026
**الإصدار:** 3.0 (Vite + Vercel)
