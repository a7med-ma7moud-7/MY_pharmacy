<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
class Medicien extends Model
{
    use HasFactory , Notifiable;
    
    protected $fillable = [
        'name',
        'image',
        'propose',
        'price',
        'type',
        'count'
    ];
    
    /**
     * علاقة الدواء بعناصر الطلبات
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'medicine_id');
    }
    
    /**
     * الحصول على صورة الدواء بمسار كامل
     */
    public function getImagePathAttribute()
    {
        if (empty($this->image)) {
            return 'images/no-image.jpg';
        }
        
        return 'storage/' . $this->image;
    }
    
    /**
     * الحصول على سعر الدواء منسق
     */
    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2) . ' ج.م';
    }
}