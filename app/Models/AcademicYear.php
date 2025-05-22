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

    public function academic_years(){
        return $this.hasMany(Semester::class, 'academicYear_id');
    }
}
