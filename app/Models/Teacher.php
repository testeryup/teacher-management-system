<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 
use App\Models\Degree;
use App\Models\Department;

class Teacher extends Model
{
    use HasFactory; 

    protected $fillable = [
        'fullName',
        'DOB',
        'phone',
        'email',
        'degree_id',
        'department_id'
    ];

    public function degree()
    {
        return $this->belongsTo(Degree::class, 'degree_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function classrooms()
    {
        return $this->hasMany(Classroom::class, 'teacher_id');
    }
}
