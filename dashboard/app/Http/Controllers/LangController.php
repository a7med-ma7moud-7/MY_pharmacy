<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LangController extends Controller
{
    public function switch(Request $request)
    {
        $lang = $request->input('lang', 'ar');
        if (!in_array($lang, ['ar', 'en'])) {
            $lang = 'ar';
        }
        session(['locale' => $lang]);
        app()->setLocale($lang);
        return back();
    }

    public function switchLang($locale)
    {
        session(['locale' => $locale]);
        app()->setLocale($locale);
        return redirect()->back();
    }
}
