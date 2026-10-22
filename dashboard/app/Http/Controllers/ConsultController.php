<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;

class ConsultController extends BaseController
{
    use AuthorizesRequests, ValidatesRequests, DispatchesJobs;
    
    /**
     * عرض صفحة الاستشاريين
     */
    public function doctor()
    {
        return view('consult.doctor');
    }
}
