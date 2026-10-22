@component('mail::message')
# تأكيد حجز الموعد

مرحباً {{ $appointment->patient_name }}،

تم حجز موعدك بنجاح مع الدكتور: **{{ $appointment->doctor->name }}**  
تاريخ الموعد: **{{ $appointment->appointment_date }}**  
الوقت: **{{ $appointment->appointment_time }}**  
سعر الكشف: **{{ $appointment->doctor->price }} ج.م**

نتمنى لك دوام الصحة والعافية،  
وشكراً لاستخدامك خدمتنا!

@endcomponent
