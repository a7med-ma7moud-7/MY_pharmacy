<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Medicien;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PharmacySeeder extends Seeder
{
    public function run(): void
    {
        if (Pharmacy::count() > 0) {
            return;
        }

        $shifaUser = User::firstOrCreate(
            ['email' => 'shifa@pharmacy.com'],
            [
                'name' => 'صيدلية الشفاء المركزية',
                'phone' => '01090000001',
                'password' => Hash::make('pharmacy123'),
                'role' => 'pharmacy',
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $shifa = Pharmacy::create([
            'user_id' => $shifaUser->id,
            'name' => 'صيدلية الشفاء المركزية',
            'phone' => '01090000001',
            'email' => 'shifa@pharmacy.com',
            'city' => 'القاهرة',
            'address' => 'شارع 9 الرئيسي، المعادي، القاهرة',
            'latitude' => 29.9602451,
            'longitude' => 31.2569134,
            'working_hours' => '24 ساعة طوال الأسبوع',
            'license_number' => 'PH-CAI-1042',
            'is_active' => true,
        ]);

        $noorUser = User::firstOrCreate(
            ['email' => 'alnoor@pharmacy.com'],
            [
                'name' => 'صيدلية النور الطبية',
                'phone' => '01090000002',
                'password' => Hash::make('pharmacy123'),
                'role' => 'pharmacy',
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $noor = Pharmacy::create([
            'user_id' => $noorUser->id,
            'name' => 'صيدلية النور الطبية',
            'phone' => '01090000002',
            'email' => 'alnoor@pharmacy.com',
            'city' => 'الجيزة',
            'address' => 'شارع التحرير، الدقي، الجيزة',
            'latitude' => 30.0384512,
            'longitude' => 31.2122341,
            'working_hours' => '9 صباحاً - 1 صباحاً',
            'license_number' => 'PH-GIZ-2088',
            'is_active' => true,
        ]);

        $unassigned = Medicien::whereNull('pharmacy_id')->orderBy('id')->get();
        foreach ($unassigned as $idx => $med) {
            $med->update([
                'pharmacy_id' => ($idx % 2 === 0) ? $shifa->id : $noor->id,
            ]);
        }

        if (Order::count() === 0) {
            $shifaMed = Medicien::where('pharmacy_id', $shifa->id)->first();
            if ($shifaMed) {
                $o1 = Order::create([
                    'pharmacy_id' => $shifa->id,
                    'customer_name' => 'كريم عبد الله',
                    'customer_phone' => '01015556677',
                    'customer_email' => 'kareem@example.com',
                    'address' => 'المعادي، شارع النصر، عمارة 14',
                    'delivery_method' => 'delivery',
                    'notes' => 'يرجى الاتصال عند الوصول',
                    'status' => 'pending',
                    'total_price' => round((float) $shifaMed->price * 2, 2),
                ]);
                OrderItem::create([
                    'order_id' => $o1->id,
                    'medicine_id' => $shifaMed->id,
                    'pharmacy_id' => $shifa->id,
                    'quantity' => 2,
                    'price' => (float) $shifaMed->price,
                    'total' => round((float) $shifaMed->price * 2, 2),
                ]);
            }

            $noorMed = Medicien::where('pharmacy_id', $noor->id)->first();
            if ($noorMed) {
                $o2 = Order::create([
                    'pharmacy_id' => $noor->id,
                    'customer_name' => 'هدى محمود',
                    'customer_phone' => '01124445566',
                    'customer_email' => 'hoda@example.com',
                    'address' => 'الدقي، بجوار مترو البحوث',
                    'delivery_method' => 'pickup',
                    'status' => 'processing',
                    'total_price' => (float) $noorMed->price,
                ]);
                OrderItem::create([
                    'order_id' => $o2->id,
                    'medicine_id' => $noorMed->id,
                    'pharmacy_id' => $noor->id,
                    'quantity' => 1,
                    'price' => (float) $noorMed->price,
                    'total' => (float) $noorMed->price,
                ]);
            }
        }
    }
}
