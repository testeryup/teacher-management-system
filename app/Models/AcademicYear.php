<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Semester;

class AcademicYear extends Model
{
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
