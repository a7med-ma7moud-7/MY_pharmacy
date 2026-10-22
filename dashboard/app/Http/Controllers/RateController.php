<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;

class RateController extends Controller
{
    public function index()
    {
        return view('rate.index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:255',
        ]);
        
        Rating::create([
            'doctor_id' => $request->doctor_id,
            'user_id' => $request->user_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return redirect()->route('webdoctor.show', $request->doctor_id)->with('success', 'تم إضافة التقييم بنجاح');
    }
}
