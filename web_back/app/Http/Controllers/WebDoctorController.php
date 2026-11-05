<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WebDoctorController extends Controller
{
    /**
     * عرض قائمة الأطباء للزوار
     */
    public function index(Request $request)
    {
        $doctors = Doctor::query()
            ->filter($request->only(['search', 'specialty', 'location', 'tow_location']))
            ->where('status', 'active')
            ->where('subscription', 'subscribed')
            ->orderBy('name', 'asc')
            ->paginate(6);

        $specialties = Doctor::getSpecialties();
        $locations = Doctor::distinct('location')->pluck('location')->toArray();
        $cities = Doctor::distinct('tow_location')->pluck('tow_location')->toArray();

        return view('webdoctor.index', compact('doctors', 'specialties', 'locations', 'cities'));
    }

    /**
     * عرض تفاصيل طبيب معين
     */
    public function show($id)
    {
        $doctor = Doctor::findOrFail($id);
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
        if (!Auth::check()) {
            abort(403);
        }

        $searchTerm = $request->search;
        $results = [];

        if ($searchTerm) {
            $directMatch = Doctor::where('name', 'like', '%' . $searchTerm . '%')
                ->orWhere('specialty', 'like', '%' . $searchTerm . '%')
                ->get();

            $nameParts = explode(' ', $searchTerm);
            $partialMatches = collect();

            foreach ($nameParts as $part) {
                if (strlen($part) > 2) {
                    $matches = Doctor::where('name', 'like', '%' . $part . '%')->get();
                    $partialMatches = $partialMatches->merge($matches);
                }
            }

            $partialMatches = $partialMatches->unique('id');

            $results = [
                'search_term' => $searchTerm,
                'direct_matches' => $directMatch->map(fn ($doc) => [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'specialty' => $doc->specialty,
                ]),
                'partial_matches' => $partialMatches->map(fn ($doc) => [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'specialty' => $doc->specialty,
                ]),
            ];
        }

        $allDoctors = Doctor::all()->map(fn ($doc) => [
            'id' => $doc->id,
            'name' => $doc->name,
            'specialty' => $doc->specialty,
        ]);

        return response()->json([
            'results' => $results,
            'all_doctors' => $allDoctors,
            'total_doctors' => count($allDoctors),
        ]);
    }
}
