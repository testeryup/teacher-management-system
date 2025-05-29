<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 
use App\Models\Semester;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'startDate',
        'endDate',
    ];
    protected $casts = [
        'startDate' => 'date:Y-m-d',  // This ensures consistent format
        'endDate' => 'date:Y-m-d',
    ];
    public function semesters(){
        return $this->hasMany(Semester::class, 'academicYear_id');
    }
}
