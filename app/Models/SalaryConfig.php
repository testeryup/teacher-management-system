<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryConfig extends Model
{
    protected $fillable = [
        'semester_id',
        'base_salary_per_lesson', 
        'status'
    ];

    protected $casts = [
        'base_salary_per_lesson' => 'decimal:2',
    ];

    public function semester(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Semester::class);
    }

    public function teacherSalaries(): HasMany
    {
        return $this->hasMany(TeacherSalary::class);
    }

    public static function rules()
    {
        return [
            'semester_id' => 'required|integer|exists:semesters,id',
            'base_salary_per_lesson' => 'required|numeric|min:0',
            'status' => 'required|in:draft,active,closed'
        ];
    }

    // Scope để lấy config active
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}