# دليل ومخطط تدفق لوحة التحكم الإدارية (Admin Dashboard Flow)

لوحة التحكم هي المركز الرئيسي لإدارة صيدلية ومنظومة **"صيدليتي"** الطبية. تتيح للمشرفين والمديرين متابعة كافة العمليات الحيوية: من حجوزات الأطباء، ومبيعات الأدوية، وحالات الطلبات، وإدارة الكوادر الطبية والمستخدمين، وصولاً إلى التقارير والتحليلات الإحصائية.

---

## 1. الهيكل العام ومخطط معمارية لوحة التحكم (Architecture Overview)

```mermaid
graph TD
    Admin([مدير النظام / Admin]) --> Auth{تسجيل الدخول /login}
    Auth -->|بيانات غير صحيحة| AuthFail[رسالة خطأ وإعادة المحاولة]
    Auth -->|بيانات صحيحة| CheckRole{فحص الصلاحية Role == admin}
    CheckRole -->|مستخدم عادي| UserDash[لوحة المستخدم العادي /home]
    CheckRole -->|مدير معتمد| Dashboard[لوحة التحكم الإدارية /admin/dashboard]

    Dashboard --> Appointments[إدارة الحجوزات الطبية /admin/appointments]
    Dashboard --> Orders[إدارة طلبات الأدوية /admin/orders]
    Dashboard --> Doctors[إدارة الأطباء /doctor]
    Dashboard --> Medicines[إدارة الأدوية /medicien]
    Dashboard --> Users[إدارة المستخدمين /users]
    Dashboard --> Reports[التقارير والإحصائيات /admin/reports]
```

---

## 2. أقسام لوحة التحكم ووظائف كل قسم

### 2.1. الواجهة الرئيسية للوحة التحكم (`/admin/dashboard`)
- **كروت الإحصائيات الفورية:**
  - إجمالي عدد الأطباء المسجلين في المنظومة.
  - إجمالي عدد الأدوية والمستحضرات المتاحة بالمخزن.
  - إجمالي عدد المستخدمين والعملاء المسجلين.
- **الجداول السريعة:**
  - استعراض أحدث الحجوزات المسجلة.
  - استعراض أحدث الأدوية المضافة مع الأسعار والمخزون.
- **التنبيهات السريعة:** إشعار الإدارة الفوري عند وصول طلب جديد أو حجز جديد.

---

### 2.2. إدارة الحجوزات الطبية (`/admin/appointments`)

يتحكم المدير في دورة حياة الحجز الطبي منذ لحظة إرساله من المريض وحتى إتمامه.

#### دورة حياة الحجز (Appointment Lifecycle Flow):
```mermaid
stateDiagram-v2
    [*] --> Pending: إنشاء حجز جديد من المريض (قيد الانتظار)
    Pending --> Confirmed: مراجعة وتأكيد الموعد من الإدارة
    Pending --> Cancelled: رفض الحجز لعدم التفرغ أو خطأ
    Confirmed --> Completed: حضور المريض وإتمام الكشف الطبي
    Confirmed --> Cancelled: اعتذار المريض أو الطبيب
    Completed --> [*]
    Cancelled --> [*]
```

#### تسلسل الأحداث والإشعارات للحجز (Sequence Flow):
```mermaid
sequenceDiagram
    autonumber
    actor Patient as المريض / الزائر
    participant System as نظام صيدليتي
    actor Admin as مدير النظام
    participant Doctor as الطبيب المعالج

    Patient->>System: تعبئة نموذج حجز موعد (طبيب، تاريخ، وقت، هاتف)
    System->>System: التحقق من عدم وجود تعارض زمني
    System->>Admin: إرسال إشعار فوري بحجز جديد (Notification)
    System-->>Patient: إرسال رسالة بريد إلكتروني بتفاصيل الحجز المبدئي
    Admin->>System: فتح لوحة الحجوزات وتغيير الحالة إلى (مؤكد Confirmed)
    System-->>Patient: تأكيد الموعد والتواصل الهاتفي
    Admin->>System: بعد الموعد تغيير الحالة إلى (مكتمل Completed)
```

---

### 2.3. إدارة طلبات الأدوية والمشتريات (`/admin/orders`)

يتيح هذا القسم متابعة طلبيات الأدوية التي تتم عبر المتجر الإلكتروني.

#### مخطط تدفق معالجة الطلب (Order Processing Flowchart):
```mermaid
flowchart TD
    NewOrder([وصول طلب شراء جديد]) --> ViewOrder[عرض تفاصيل الطلب والأدوية المطلوبة]
    ViewOrder --> CheckStock{التحقق من توافر الكميات بالمخزن}
    
    CheckStock -->|غير متوفر| CancelOrder[تغيير الحالة إلى ملغي Cancelled]
    CancelOrder --> ContactCustCancel[التواصل مع العميل وإبلاغه]
    
    CheckStock -->|متوفر| ProcessOrder[تغيير الحالة إلى قيد التجهيز Processing]
    ProcessOrder --> PickPack[تجهيز الأدوية من الرفوف وتغليفها]
    
    PickPack --> DeliveryType{نوع الاستلام؟}
    DeliveryType -->|توصيل للمنزل Delivery| DispatchCourier[تسليم الطلب لمندوب التوصيل]
    DeliveryType -->|استلام من الصيدلية Pickup| ReadyAtBranch[الطلب جاهز بالفرع للاستلام]
    
    DispatchCourier --> CompleteOrder[تغيير الحالة إلى مكتمل Completed]
    ReadyAtBranch --> CompleteOrder
    CompleteOrder --> ExportExcel[إمكانية تصدير البيانات إلى Excel]
```

- **المميزات المدمجة:**
  - **البحث المتقدم:** بالاسم، رقم الهاتف، البريد الإلكتروني، أو رقم الطلب (`Order ID`).
  - **تصدير إكسيل (Excel Export):** بنقرة واحدة لتحميل شيت إكسيل بجميع المبيعات للمحاسبة.

---

### 2.4. إدارة الأطباء والعيادات (`/doctor`)

```mermaid
graph LR
    DoctorCRUD[إدارة الأطباء] --> CreateDoc[إضافة طبيب جديد]
    DoctorCRUD --> EditDoc[تعديل البيانات]
    DoctorCRUD --> DeleteDoc[حذف طبيب]
    DoctorCRUD --> ViewDoc[معاينة الملف الكامل]

    CreateDoc --> DocFields["الاسم - التخصص - سعر الكشف - الهاتف - المحافظة - المدينة - صور العيادة"]
```

---

### 2.5. إدارة الأدوية والمخزون (`/medicien`)

```mermaid
graph LR
    MedCRUD[إدارة الأدوية] --> AddMed[إضافة صنف دواء جديد]
    MedCRUD --> EditMed[تحديث الأسعار والمخزون]
    MedCRUD --> DelMed[حذف صنف منتهي]
    
    AddMed --> MedFields["اسم الدواء - صورة العلبة - دواعي الاستعمال - نوع الدواء أقراص/شراب - السعر - الكمية"]
```

---

### 2.6. قسم التقارير والإحصائيات (`/admin/reports`)

يقوم بجمع وتحليل مؤشرات الأداء الرئيسية (KPIs) لمساعدة الإدارة في اتخاذ القرارات:

```mermaid
pie title توزيع مصادر تقارير الأداء
    "إحصائيات الزوار والجلسات" : 25
    "حجم مبيعات الأدوية والإيرادات" : 35
    "تحليلات الحجوزات ونسب الإلغاء" : 25
    "أداء ونشاط الأطباء المسجلين" : 15
```

---

## 3. خريطة مسارات لوحة التحكم (Admin Sitemap)

| المسار (Route) | الوظيفة | الصلاحية المطلوبة |
| :--- | :--- | :--- |
| `/admin/dashboard` | الصفحة الرئيسية والإحصائيات العامة | مسجل كمدير `role: admin` |
| `/admin/appointments` | استعراض ومتابعة الحجوزات | مسجل كمدير `role: admin` |
| `/admin/appointments/{id}` | تفاصيل حجز كشف طبي لمريض | مسجل كمدير `role: admin` |
| `/admin/orders` | جدول طلبات الأدوية من المتجر | مسجل كمدير `role: admin` |
| `/admin/orders/{id}` | فاتورة تفصيلية ومحتويات الطلب | مسجل كمدير `role: admin` |
| `/admin/orders-export` | تصدير الطلبات كملف Excel | مسجل كمدير `role: admin` |
| `/admin/reports` | رسوم بيانية وتقارير المبيعات والحجوزات | مسجل كمدير `role: admin` |
| `/doctor` | قائمة الأطباء وإدارتهم (CRUD) | مسجل كمدير `role: admin` |
| `/medicien` | قائمة الأدوية وإدارتها (CRUD) | مسجل كمدير `role: admin` |
| `/users` | حسابات المستخدمين وصلاحياتهم | مسجل كمدير `role: admin` |
