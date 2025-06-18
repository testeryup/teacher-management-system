<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'name',
        'abbrName',
        'description'
    ];
    
    public function teachers(): HasMany{
        return $this->hasMany(Teacher::class, 'department_id');
    }

    public function users(): HasMany{
        return $this->hasMany(User::class, 'department_id');
    }

    public function courses(): HasMany{
        return $this->hasMany(Course::class, 'department_id');
    }
}
