<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookingdoctor extends Model
{
  protected $fillable = [
    'doctor_id',
    'name',
    'email',
    'number' 
  ];


}
