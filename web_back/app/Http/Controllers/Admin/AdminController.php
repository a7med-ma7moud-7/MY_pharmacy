<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Medicien;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdminController extends Controller
{
    public function  mediciens() {
       
        return view ('admin.index');
        
    }
  
    /**
     * عرض لوحة تحكم المدير
     */
    public function dashboard()
    {
        // إحصائيات النظام
        $totalDoctors = Doctor::count();
        $totalMedicines = Medicien::count();
        $totalUsers = User::count();
        
        // أحدث الأطباء
        $doctors = Doctor::latest()->take(5)->get();
        
        // أحدث الأدوية
        $medicines = Medicien::latest()->take(5)->get();
        
        return view('admin.dashboard', [
            'totalDoctors' => $totalDoctors,
            'totalMedicines' => $totalMedicines,
            'totalUsers' => $totalUsers,
            'doctors' => $doctors,
            'medicines' => $medicines,
        ]);
    }
}
