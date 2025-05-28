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
        'code',
        'class_coefficient'
    ];

    public static function rules($id = null){
        return [
            'name' => 'required|string|max:255',
            'semester_id' => 'required|integer|exists:semesters,id',
            'course_id' => 'required|integer|exists:courses,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
            'students' => 'required|integer|min:0|max:200',
            'code' => 'nullable|string|max:10|unique:classrooms,code' . ($id ? ",$id" : ''),
            'class_coefficient' => 'nullable|numeric|between:-0.5,0.5',
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

    /**
     * Calculate class coefficient based on student count
     */
    public function calculateClassCoefficient(): float
    {
        $students = $this->students;
        
        if ($students < 20) {
            return -0.3;
        } elseif ($students >= 20 && $students <= 29) {
            return -0.2;
        } elseif ($students >= 30 && $students <= 39) {
            return -0.1;
        } elseif ($students >= 40 && $students <= 49) {
            return 0.0;
        } elseif ($students >= 50 && $students <= 59) {
            return 0.1;
        } elseif ($students >= 60 && $students <= 69) {
            return 0.2;
        } elseif ($students >= 70 && $students <= 79) {
            return 0.3;
        } else {
            // For students >= 80, use highest coefficient
            return 0.3;
        }
    }

    /**
     * Auto-update class coefficient when students count changes
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($classroom) {
            $classroom->class_coefficient = $classroom->calculateClassCoefficient();
        });
    }
}
