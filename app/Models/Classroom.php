<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Course;
use App\AutoGenerateCode;

class Classroom extends Model
{
    protected $codePrefix = 'LH';
    protected $codeColumn = 'code';
    
    protected $fillable = [
        'name',
        'semester_id',
        'course_id',
        'teacher_id',
        'students',
    ];

    public function course(){
        return $this->belongsTo(Course::class, 'course_id');
    }
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}
