<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryConfig extends Model
{
    protected $fillable = [
        'month',
        'base_salary_per_lesson', 
        'status'
    ];

    protected $casts = [
        'base_salary_per_lesson' => 'decimal:2',
    ];

    public function teacherSalaries(): HasMany
    {
        return $this->hasMany(TeacherSalary::class);
    }

    public static function rules()
    {
        return [
            'month' => 'required|string|regex:/^\d{4}-\d{2}$/',
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