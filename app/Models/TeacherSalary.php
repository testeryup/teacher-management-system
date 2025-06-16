<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherSalary extends Model
{
    protected $fillable = [
        'teacher_id',
        'classroom_id', 
        'salary_config_id',
        'actual_lessons',
        'class_coefficient',
        'course_coefficient',
        'teacher_coefficient',
        'converted_lessons',
        'total_salary'
    ];

    protected $casts = [
        'class_coefficient' => 'decimal:1',
        'course_coefficient' => 'decimal:1', 
        'teacher_coefficient' => 'decimal:1',
        'converted_lessons' => 'decimal:2',
        'total_salary' => 'decimal:2'
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function salaryConfig(): BelongsTo
    {
        return $this->belongsTo(SalaryConfig::class);
    }
}