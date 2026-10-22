<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable  = [
        'name','image','specialty','price','number','location','tow_location','status','subscription'
    ];
    public static function getSpecialties()
    {
        return self::distinct('specialty')->pluck('specialty')->toArray();
    }
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = trim($value);
    }
    
    /**
     * تعديل قيمة التخصص قبل الحفظ
     */
    public function setSpecialtyAttribute($value)
    {
        $this->attributes['specialty'] = trim($value);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'doctor_id');
    }
}
