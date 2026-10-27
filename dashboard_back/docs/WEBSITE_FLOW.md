# دليل ومخطط تدفق الموقع الإلكتروني للمستخدمين (Website & User Flow)

الموقع الإلكتروني لمنظومة **"صيدليتي"** يمثل الواجهة الأمامية الشاملة الموجهة للجمهور والمرضى. يتيح للمستخدمين البحث عن الأطباء وحجز المواعيد، وتصفح الأدوية وطلبها عبر سلة المشتريات، والاستفادة من الصيدلي الذكي (AI)، ومتابعة حالات الطلبات.

---

## 1. خريطة رحلة المستخدم العامة (User Journey Map)

```mermaid
graph TD
    Visitor([الزائر / المريض]) --> Home[الصفحة الرئيسية /]

    Home --> DoctorsSection[دليل الأطباء /doctors]
    Home --> MedicinesSection[متجر الأدوية /medicines]
    Home --> BookingSection[حجز موعد كشف /appointments]
    Home --> AIChatSection[الصيدلي الذكي /ai-chat]
    Home --> ReviewsSection[تقييمات وآراء العملاء /rate]
    Home --> AuthSection[تسجيل الدخول / حساب جديد /login]

    DoctorsSection --> DoctorProfile[الملف الشخصي للطبيب]
    DoctorProfile --> BookingSection
    DoctorProfile --> AddRating[كتابة تقييم للطبيب]

    MedicinesSection --> MedDetail[تفاصيل الدواء]
    MedDetail --> Cart[سلة المشتريات Cart]
    Cart --> Checkout[إتمام الطلب Checkout]
    Checkout --> TrackOrder[تتبع حالة الطلب /orders/status]
```

---

## 2. المسارات والخدمات الرئيسية بالتفصيل

### 2.1. الصفحة الرئيسية (Landing Page - `/`)
- **الهيرو سيكشن (Hero Section):** عنوان ترحيبي، ومقدمة عن خدمات الصيدلية والمنصة، مع أزرار سريعة "ابدأ الآن" و"تعرف على المزيد".
- **شريط التنقل الذكي (Smart Navigation):** يتكيف تلقائياً؛ حيث يعرض أزرار تسجيل الدخول وحساب جديد للزوار، أو اسم المستخدم ولوحة الحساب للمسجلين.
- **مربعات الميزات الستة (Features):**
  1. إدارة المخزون وتوفير الأدوية.
  2. التعامل مع الوصفات الطبية بدقة.
  3. الرسوم والتقارير.
  4. إدارة ملفات المرضى.
  5. نظام التنبيهات الفورية.
  6. التوافق التام مع الجوال والتابلت (Responsive).
- **التواصل والدعم الفني:** روابط سريعة ومعلومات التواصل في الفوتر.

---

### 2.2. رحلة البحث عن طبيب وحجز موعد (Doctor Search & Booking)

```mermaid
sequenceDiagram
    autonumber
    actor Patient as المريض / الزائر
    participant Web as صفحة الأطباء /doctors
    participant Form as نموذج الحجز /appointments
    participant DB as قاعدة البيانات
    participant Mail as خدمة البريد الإلكتروني

    Patient->>Web: استخدام الفلاتر (التخصص، المحافظة، المدينة)
    Web-->>Patient: استعراض بطاقات الأطباء والأسعار والتقييمات
    Patient->>Form: الضغط على "حجز موعد"
    Form-->>Patient: فتح نموذج الحجز (اختيار التاريخ والوقت)
    Patient->>Form: إدخال الاسم، الهاتف، والإيميل والضغط على "تأكيد الحجز"
    Form->>DB: فحص عدم تعارض الموعد مع حجز آخر
    alt الموعد محجوز مسبقاً
        DB-->>Patient: تنبيه: الموعد محجوز بالفعل، اختر وقتاً آخر
    else الموعد شاغر ومتاح
        DB->>DB: حفظ الحجز بحالة (قيد الانتظار Pending)
        DB->>Mail: إرسال بريد تأكيدي للمريض
        DB-->>Patient: التحويل إلى صفحة النجاح (Success Page) برقم الحجز
    end
```

---

### 2.3. رحلة صيدلية ومتجر الأدوية والشراء (Medicine Store & Cart Flow)

```mermaid
flowchart TD
    Browse[تصفح قائمة الأدوية /medicines] --> FilterType[تصفية حسب نوع الدواء: أقراص، فوار، شراب...]
    FilterType --> SearchMed[البحث باسم الدواء أو الاستعمال]
    SearchMed --> ViewDetails[عرض تفاصيل الدواء والسعر والمخزون]
    
    ViewDetails --> AddToCart[الضغط على إضافة إلى السلة]
    AddToCart --> LocalStorage[(تحديث السلة في المتصفح LocalStorage)]
    
    LocalStorage --> OpenCartModal[فتح نافذة سلة المشتريات]
    OpenCartModal --> AdjustQty[تعديل الكميات أو حذف أصناف]
    AdjustQty --> CheckoutClick[الضغط على إتمام الطلب Checkout]
    
    CheckoutClick --> FillOrderForm[تعبئة بيانات التوصيل]
    FillOrderForm --> FormFields["الاسم - الهاتف - العنوان - طريقة الاستلام (توصيل/استلام)"]
    
    FormFields --> SubmitOrder[إرسال الطلب POST /orders]
    SubmitOrder --> SaveDB[(حفظ الطلب وعناصره في قاعدة البيانات)]
    SaveDB --> ClearCart[تفريغ سلة المشتريات]
    ClearCart --> ShowOrderCode[إظهار رقم الطلب ورابط تتبع الحالة]
```

---

### 2.4. تتبع حالة الطلب (Order Status Tracking)

```mermaid
graph LR
    EnterCode[العميل يدخل رقم الطلب ورقم الهاتف] --> VerifyOrder{التحقق من البيانات}
    VerifyOrder -->|بيانات غير متطابقة| ErrMsg[رسالة: لم يتم العثور على الطلب]
    VerifyOrder -->|بيانات صحيحة| StatusDisplay[عرض بطاقة تفاصيل الطلب]

    StatusDisplay --> S1[قيد الانتظار Pending ⏳]
    StatusDisplay --> S2[قيد التجهيز Processing 📦]
    StatusDisplay --> S3[مكتمل وجاهز Completed ✅]
    StatusDisplay --> S4[ملغي Cancelled ❌]
```

---

### 2.5. الصيدلي الذكي ومساعد الذكاء الاصطناعي (AI Pharmacist Flow)

يوفر الموقع مساعداً طبياً وصيدلانياً يعمل بالذكاء الاصطناعي للإجابة عن استفسارات المرضى حول دواعي استعمال الأدوية، والجرعات، وتعارضات الأدوية:

```mermaid
flowchart TD
    UserQ([المريض يطرح سؤالاً صيدلانياً]) --> FrontendReq[إرسال السؤال إلى POST /ask-ai]
    FrontendReq --> Backend[AIChatController]

    Backend --> CheckRouterKey{هل مفتاح OpenRouter متوفر؟}
    
    CheckRouterKey -->|نعم| TryOpenRouter[تجربة نماذج OpenRouter المجانية: LLaMA / Gemma]
    TryOpenRouter -->|نجح النموذج| ReturnAnswer[إرجاع الإجابة الصيدلية المنسقة]
    
    TryOpenRouter -->|فشل أو غير متاح| FallbackGemini[التحويل التلقائي لمفتاح Google Gemini 2.0]
    CheckRouterKey -->|لا| FallbackGemini
    
    FallbackGemini -->|نجاح Gemini| ReturnAnswer
    FallbackGemini -->|فشل كلي| ErrorSafe[رسالة اعتذار آمنة: الخدمة غير متاحة مؤقتاً]
    
    ReturnAnswer --> DisplayChat[عرض الإجابة الفورية داخل واجهة الشات للمريض]
```

---

### 2.6. التقييمات والمراجعات (Rating & Review Flow)

- **الرابط:** `/rate`
- **الشروط:** متاح للمستخدمين المسجلين بالموقع.
- **الخطوات:**
  1. اختيار الطبيب أو الخدمة.
  2. تحديد التقييم بالنجوم من (1 إلى 5 نجوم).
  3. كتابة التعليق ورأي المريض.
  4. حفظ التقييم ليظهر مباشرة في صفحة الطبيب لحساب متوسط تقييمه.

---

## 3. خريطة مسارات صفحات الموقع (Website Sitemap)

| اسم الصفحة | الرابط (Route) | نوع الوصول |
| :--- | :--- | :--- |
| الرئيسية | `/` | متاح للجميع |
| دليل الأطباء | `/doctors` | متاح للجميع |
| البحث عن طبيب | `/doctors/search` | متاح للجميع |
| تفاصيل الطبيب | `/doctors/{id}` | متاح للجميع |
| صيدلية الأدوية | `/medicines` | متاح للجميع |
| البحث في الأدوية | `/medicines/search` | متاح للجميع |
| تفاصيل الدواء | `/medicines/{id}` | متاح للجميع |
| حجز موعد كشف | `/appointments` | متاح للجميع |
| نجاح الحجز | `/appointments/success/{id}` | متاح للجميع |
| تتبع الطلبات | `/orders/status` | متاح للجميع |
| الصيدلي الذكي AI | `/ai-chat` | متاح للجميع |
| صفحة التقييمات | `/rate` | يتطلب تسجيل دخول |
| تسجيل الدخول | `/login` | للزوار غير المسجلين |
| تسجيل حساب جديد | `/register` | للزوار غير المسجلين |
| حسابي الشخصي | `/home` | للمستخدمين المسجلين |
