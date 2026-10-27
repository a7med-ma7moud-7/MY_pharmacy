<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Medicien;
use Illuminate\Database\Seeder;

class DataSeeder extends Seeder
{
    public function run(): void
    {
        if (Doctor::count() === 0) {
            Doctor::create([
                'name' => 'أحمد الشناوي',
                'image' => 'doctors/default.png',
                'specialty' => 'عظام',
                'price' => '250',
                'number' => '01012345678',
                'location' => 'القاهرة',
                'tow_location' => 'المعادي',
                'status' => 'متاح',
                'subscription' => 'سنوي'
            ]);

            Doctor::create([
                'name' => 'سارة عبد الرحمن',
                'image' => 'doctors/default.png',
                'specialty' => 'أطفال',
                'price' => '200',
                'number' => '01123456789',
                'location' => 'الجيزة',
                'tow_location' => 'الدقي',
                'status' => 'متاح',
                'subscription' => 'شهري'
            ]);

            Doctor::create([
                'name' => 'محمد فاروق',
                'image' => 'doctors/default.png',
                'specialty' => 'باطنة',
                'price' => '300',
                'number' => '01234567890',
                'location' => 'الإسكندرية',
                'tow_location' => 'سموحة',
                'status' => 'متاح',
                'subscription' => 'سنوي'
            ]);

            Doctor::create([
                'name' => 'منى خليل',
                'image' => 'doctors/default.png',
                'specialty' => 'قلب',
                'price' => '350',
                'number' => '01512345678',
                'location' => 'القاهرة',
                'tow_location' => 'مصر الجديدة',
                'status' => 'متاح',
                'subscription' => 'سنوي'
            ]);

            Doctor::create([
                'name' => 'حسام الدين كمال',
                'image' => 'doctors/default.png',
                'specialty' => 'عيون',
                'price' => '220',
                'number' => '01098765432',
                'location' => 'القاهرة',
                'tow_location' => 'مدينة نصر',
                'status' => 'متاح',
                'subscription' => 'شهري'
            ]);
        }

        if (Medicien::count() === 0) {
            Medicien::create([
                'name' => 'بنادول إكسترا (Panadol Extra)',
                'image' => 'medicines/default.png',
                'propose' => 'مسكن للآلام وخافض للحرارة فعال للصداع وآلام الجسم',
                'price' => '45',
                'type' => 'أقراص',
                'count' => '100'
            ]);

            Medicien::create([
                'name' => 'كونجستال (Congestal)',
                'image' => 'medicines/default.png',
                'propose' => 'علاج أعراض نزلات البرد والإنفلونزا والرشح',
                'price' => '35',
                'type' => 'أقراص',
                'count' => '80'
            ]);

            Medicien::create([
                'name' => 'أوجمنتين 1 جم (Augmentin 1g)',
                'image' => 'medicines/default.png',
                'propose' => 'مضاد حيوي واسع المجال لعلاج الالتهابات البكتيرية',
                'price' => '110',
                'type' => 'أقراص',
                'count' => '50'
            ]);

            Medicien::create([
                'name' => 'كتافلام 50 ملجم (Cataflam 50mg)',
                'image' => 'medicines/default.png',
                'propose' => 'مسكن سريع للآلام ومضاد للالتهاب والروماتيزم',
                'price' => '55',
                'type' => 'أقراص',
                'count' => '70'
            ]);

            Medicien::create([
                'name' => 'أنتودين 40 ملجم (Antodine 40mg)',
                'image' => 'medicines/default.png',
                'propose' => 'علاج قرحة المعدة وارتجاع المريء والحموضة',
                'price' => '60',
                'type' => 'أقراص',
                'count' => '45'
            ]);

            Medicien::create([
                'name' => 'فيتامين سي 1000 ملجم (Vitamin C)',
                'image' => 'medicines/default.png',
                'propose' => 'مكمل غذائي لتقوية المناعة ومقاومة الإجهاد',
                'price' => '75',
                'type' => 'فوار',
                'count' => '90'
            ]);
        }
    }
}
