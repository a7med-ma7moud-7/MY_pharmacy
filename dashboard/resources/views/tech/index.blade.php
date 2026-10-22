<x-user-layout>
    <x-slot name="header">
        <h2 class="fw-bold m-0">
            <i class="fas fa-headset me-2 text-black"></i>
            الدعم الفني
        </h2>
    </x-slot>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white text-center">
                        <h3 class="mb-0">طرق التواصل مع الدعم الفني</h3>
                    </div>
                    <div class="card-body text-center">
                        <p class="mb-4">يمكنك التواصل معنا عبر أي من الوسائل التالية:</p>
                        <div class="d-flex justify-content-center gap-4 flex-wrap mb-4">
                            <a href="https://wa.me/201234567890" target="_blank" class="contact-icon whatsapp">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <a href="mailto:info@mypharmacy.com" class="contact-icon email">
                                <i class="fas fa-envelope"></i>
                            </a>
                            <a href="https://facebook.com/mypharmacy" target="_blank" class="contact-icon facebook">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                        </div>
                        <div class="d-flex justify-content-center gap-4 flex-wrap">
                            <span>واتساب</span>
                            <span>البريد الإلكتروني</span>
                            <span>فيسبوك</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <style>
        .contact-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            font-size: 2.2rem;
            color: #fff;
            background: #6c757d;
            transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 8px;
        }
        .contact-icon.whatsapp { background: #25d366; }
        .contact-icon.email { background: #ea4335; }
        .contact-icon.facebook { background: #1877f3; }
        .contact-icon:hover {
            transform: scale(1.12) rotate(-6deg);
            box-shadow: 0 4px 16px rgba(0,0,0,0.18);
            filter: brightness(1.1);
            text-decoration: none;
        }
    </style>
</x-user-layout>