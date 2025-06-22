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
    protected $casts = [
        'startDate' => 'date:Y-m-d',  // This ensures consistent format
        'endDate' => 'date:Y-m-d',
    ];
    public function semesters(){
        return $this->hasMany(Semester::class, 'academicYear_id');
    }
    public function hasSalaryConfigs(): bool
    {
        return \App\Models\SalaryConfig::whereIn('semester_id', 
            $this->semesters()->pluck('id')
        )->exists();
    }

    public function canBeDeleted(): bool
    {
        return !$this->hasSalaryConfigs() ;
            // && !$this->semesters()->exists();
    }

    public function salaryConfigs()
    {
        return \App\Models\SalaryConfig::whereIn('semester_id', 
            $this->semesters()->pluck('id')
        );
    }
}
