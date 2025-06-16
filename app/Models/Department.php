<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Course;

class Department extends Model
{
    protected $fillable = [
        'name',
        'abbrName',
        'description'
    ];
    
    public function teachers(){
        return $this->hasMany(Teacher::class, 'department_id');
    }

    public function users(): hasMany{
        return $this->hasMany(User::class, 'department_id');
    }

    public function courses(): hasMany{
        return $this->hasMany(Course::class, 'department_id');
    }
}
