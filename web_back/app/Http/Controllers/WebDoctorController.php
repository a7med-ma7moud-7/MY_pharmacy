<?php

namespace App\Http\Controllers;

use App\Models\doctor;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

class WebDoctorController extends BaseController
{
    use AuthorizesRequests, ValidatesRequests, DispatchesJobs;
    
    /**
     * عرض قائمة الأطباء للزوار
     */
    public function index(Request $request)
    {
        $query = doctor::query();
        
        // البحث حسب الاسم
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            
            // تنظيف مصطلح البحث وإزالة الأحرف الخاصة
            $searchTerm = trim($searchTerm);
            
            $query->where(function($q) use ($searchTerm) {
                // البحث في الاسم والتخصص بشكل أكثر مرونة
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('specialty', 'like', '%' . $searchTerm . '%');
                  
                // البحث في أجزاء الاسم (للأسماء المركبة)
                $nameParts = explode(' ', $searchTerm);
                foreach ($nameParts as $part) {
                    if (strlen($part) > 2) { // تجاهل الكلمات القصيرة جدًا
                        $q->orWhere('name', 'like', '%' . $part . '%');
                    }
                }
            });
        }
        
        // التصفية حسب التخصص
        if ($request->has('specialty') && !empty($request->specialty) && $request->specialty != 'كل التخصصات') {
            $query->where('specialty', $request->specialty);
        }
        
        // التصفية حسب المحافظة
        if ($request->has('location') && !empty($request->location)) {
            $query->where('location', $request->location);
        }
        
        // التصفية حسب المدينة
        if ($request->has('tow_location') && !empty($request->tow_location)) {
            $query->where('tow_location', $request->tow_location);
        }
        
        // ترتيب النتائج
        $query->orderBy('name', 'asc');
        
        $doctors = $query-> where('status', 'active')->where('subscription', 'subscribed')->paginate(6);
        
        // الحصول على قائمة التخصصات المتاحة
        $specialties = doctor::distinct('specialty')->pluck('specialty')->toArray();
        
        $locations = doctor::distinct('location')->pluck('location')->toArray();
        $cities = doctor::distinct('tow_location')->pluck('tow_location')->toArray();
        
        return view('webdoctor.index', compact('doctors', 'specialties', 'locations', 'cities'));
    }
    
    /**
     * عرض تفاصيل طبيب معين
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function show($id)
    {
        $doctor = doctor::findOrFail($id);
        $ratings = $doctor->ratings()->with('user')->latest()->get();
        $averageRating = $ratings->avg('rating');
        $ratingsCount = $ratings->count();
        return view('webdoctor.show', compact('doctor', 'ratings', 'averageRating', 'ratingsCount'));
    }
    
    /**
     * البحث عن الأطباء
     */
    public function search(Request $request)
    {
        return $this->index($request);
    }
    
    /**
     * تشخيص البحث (للمطورين فقط)
     */
    public function debug(Request $request)
    {
        // التحقق من وجود مستخدم مسجل الدخول
        if (!Auth::check()) {
            abort(403);
        }
        
        $searchTerm = $request->search;
        $results = [];
        
        if ($searchTerm) {
            // البحث المباشر
            $directMatch = doctor::where('name', 'like', '%' . $searchTerm . '%')
                ->orWhere('specialty', 'like', '%' . $searchTerm . '%')
                ->get();
                
            // البحث في أجزاء الاسم
            $nameParts = explode(' ', $searchTerm);
            $partialMatches = collect();
            
            foreach ($nameParts as $part) {
                if (strlen($part) > 2) {
                    $matches = doctor::where('name', 'like', '%' . $part . '%')->get();
                    $partialMatches = $partialMatches->merge($matches);
                }
            }
            
            $partialMatches = $partialMatches->unique('id');
            
            $results = [
                'search_term' => $searchTerm,
                'direct_matches' => $directMatch->map(function($doc) {
                    return ['id' => $doc->id, 'name' => $doc->name, 'specialty' => $doc->specialty];
                }),
                'partial_matches' => $partialMatches->map(function($doc) {
                    return ['id' => $doc->id, 'name' => $doc->name, 'specialty' => $doc->specialty];
                })
            ];
        }
        
        // جميع الأطباء
        $allDoctors = doctor::all()->map(function($doc) {
            return ['id' => $doc->id, 'name' => $doc->name, 'specialty' => $doc->specialty];
        });
        
        return response()->json([
            'results' => $results,
            'all_doctors' => $allDoctors,
            'total_doctors' => count($allDoctors)
        ]);
    }
}

