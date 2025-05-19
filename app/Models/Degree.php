<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher;

class Degree extends Model
{
    protected $fillable = [
        'name',
        'baseSalaryFactor',
    ];

    public function teachers(){
        return $this->hasMany(Teacher::class, 'degree_id');
    }
}
