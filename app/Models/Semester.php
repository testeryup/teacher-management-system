<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\SalaryConfig;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;  

class Semester extends Model
{
    protected $fillable = [
        'name',
        'academicYear_id',
        'startDate',
        'endDate',
    ];
    protected $casts = [
        'startDate' => 'date',
        'endDate' => 'date',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AcademicYear::class, 'academicYear_id');
    }

    public function classrooms() : HasMany
    {
        return $this->hasMany(Classroom::class, 'semester_id');
    }
    
    public function salary_config() : HasMany
    {
        return $this->hasMany(SalaryConfig::class, 'semester_id');
    }
    public function salaryConfigs(): HasMany
    {
        return $this->salary_config();
    }
    protected $appends = [];

    // FIX: Override toArray để đảm bảo consistent naming
    public function toArray()
    {
        $array = parent::toArray();
        
        // Đảm bảo relationship academicYear được serialize đúng tên
        if (isset($array['academic_year'])) {
            $array['academicYear'] = $array['academic_year'];
            unset($array['academic_year']);
        }
        
        return $array;
    }
}
