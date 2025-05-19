<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher;

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
}
