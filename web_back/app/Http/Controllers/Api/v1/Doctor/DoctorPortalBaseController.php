<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

abstract class DoctorPortalBaseController extends Controller
{
    protected function currentDoctor(Request $request): Doctor
    {
        $attrDoc = $request->attributes->get('current_doctor');
        if ($attrDoc instanceof Doctor) {
            return $attrDoc;
        }

        /** @var User $user */
        $user = Auth::user();
        return Doctor::where('user_id', $user->id)->firstOrFail();
    }
}
