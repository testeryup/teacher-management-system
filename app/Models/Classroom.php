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

    // Validation rules cho bulk creation
    public static function bulkRules(){
        return [
            'course_id' => 'required|integer|exists:courses,id',
            'semester_id' => 'required|integer|exists:semesters,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
            'students_per_class' => 'required|integer|min:1|max:200',
            'number_of_classes' => 'required|integer|min:1|max:20',
            'class_name_prefix' => 'required|string|max:50',
        ];
    }

    // Method để kiểm tra trùng tên lớp trong cùng học kỳ và môn học
    public static function checkDuplicateInSemesterCourse($name, $semesterId, $courseId, $excludeId = null)
    {
        $query = self::where('name', $name)
            ->where('semester_id', $semesterId)
            ->where('course_id', $courseId);
            
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function course(){
        return $this->belongsTo(Course::class);
    }

    public function teacher(){
        return $this->belongsTo(Teacher::class);
    }

    public function semester(){
        return $this->belongsTo(Semester::class);
    }
}
