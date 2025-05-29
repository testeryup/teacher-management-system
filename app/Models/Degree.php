<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 
use App\Models\Teacher;

class Degree extends Model
{
    use HasFactory; 

    protected $fillable = [
        'name',
        'baseSalaryFactor',
    ];

    public function teachers(){
        return $this->hasMany(Teacher::class, 'degree_id');
    }
}
