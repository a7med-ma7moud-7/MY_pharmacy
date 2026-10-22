<?php

namespace App\Http\Controllers;

use App\Models\medicien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $mediciens = medicien::all();
       return view('medicin.index', compact('mediciens'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('medicin.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|numeric|min:0',
        ]);
        
        $medicien = new medicien($validatedData);
        
        // معالجة الصورة
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('medicines', 'public');
            $medicien->image = $imagePath;
        }
        
        $medicien->save();
        return redirect()->route('medicien.index')->with('success', 'تم إضافة الدواء بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(medicien $medicien)
    {
        return view('medicin.show', compact('medicien'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(medicien $medicien)
    {
        return view('medicin.edit', compact('medicien'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, medicien $medicien)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|numeric|min:0',
        ]);
        
        $medicien->name = $validatedData['name'];
        $medicien->propose = $validatedData['propose'];
        $medicien->price = $validatedData['price'];
        
        // معالجة الصورة
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إذا وجدت
            if ($medicien->image) {
                Storage::disk('public')->delete($medicien->image);
            }
            
            $imagePath = $request->file('image')->store('medicines', 'public');
            $medicien->image = $imagePath;
        }
        
        $medicien->save();
        return redirect()->route('medicien.index')->with('success', 'تم تحديث الدواء بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(medicien $medicien)
    {
        // حذف الصورة إذا وجدت
        if ($medicien->image) {
            Storage::disk('public')->delete($medicien->image);
        }
        
        $medicien->delete();
        return redirect()->route('medicien.index')->with('success', 'تم حذف الدواء بنجاح');
    }
}
