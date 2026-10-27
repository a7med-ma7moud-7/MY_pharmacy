<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TechController extends Controller
{
    public function index()
    {
        return view('tech.index');
    }
}
