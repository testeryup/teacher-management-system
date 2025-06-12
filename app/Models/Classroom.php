<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Semester;
use App\AutoGenerateCode;

class Classroom extends Model
{
    use AutoGenerateCode;

    protected $codePrefix = 'LH';
    protected $codeColumn = 'code';
    
    protected $fillable = [
        'name',
        'semester_id',
        'course_id',
        'teacher_id',
        'students',
        'code'
    ];

    public static function rules($id = null){
        return [
            'name' => 'required|string|max:255',
            'semester_id' => 'required|integer|exists:semesters,id',
            'course_id' => 'required|integer|exists:courses,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
            'students' => 'required|integer|min:0|max:200',
            'code' => 'nullable|string|max:10|unique:classrooms,code' . ($id ? ",$id" : ''),
        ];
    }
    public function course(){
        return $this->belongsTo(Course::class, 'course_id');
    }
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
    public function semester(){
        return $this->belongsTo(Semester::class, 'semester_id');
    }
}
