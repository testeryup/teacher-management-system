<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AcademicYear;

class Semester extends Model
{
    protected $fillable = [
        'name',
        'academicYear_id',
        'startDate',
        'endDate',
    ];

    public function academicYear(){
        return $this->belongsTo(AcademicYear::class, 'academicYear_id');
    }
}
