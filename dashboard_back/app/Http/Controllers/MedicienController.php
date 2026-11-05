<?php

namespace App\Http\Controllers;

use App\Models\Medicien;
use Illuminate\Http\Request;

class MedicienController extends Controller
{
    public function index()
    {
        $mediciens = Medicien::all();
        return view('medicin.index', compact('mediciens'));
    }

    public function create()
    {
        return view('medicin.create');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|numeric|min:0',
        ]);

        $medicien = new Medicien(collect($validatedData)->except('image')->toArray());
        $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines');
        $medicien->save();

        return redirect()->route('medicien.index')->with('success', 'تم إضافة الدواء بنجاح');
    }

    public function show(Medicien $medicien)
    {
        return view('medicin.show', compact('medicien'));
    }

    public function edit(Medicien $medicien)
    {
        return view('medicin.edit', compact('medicien'));
    }

    public function update(Request $request, Medicien $medicien)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'propose' => 'required|string|max:225',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:225',
            'count' => 'required|numeric|min:0',
        ]);

        $medicien->fill(collect($validatedData)->except('image')->toArray());

        if ($request->hasFile('image')) {
            $medicien->image = $medicien->storeUploadedImage($request, 'image', 'medicines', $medicien->image);
        }

        $medicien->save();

        return redirect()->route('medicien.index')->with('success', 'تم تحديث الدواء بنجاح');
    }

    public function destroy(Medicien $medicien)
    {
        $medicien->deleteStoredImage($medicien->image);
        $medicien->delete();

        return redirect()->route('medicien.index')->with('success', 'تم حذف الدواء بنجاح');
    }
}
