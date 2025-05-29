<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 
use App\Models\Teacher;

class Department extends Model
{
    use HasFactory; 

    protected $fillable = [
        'name',
        'abbrName',
        'description'
    ];

    public function teachers(){
        return $this->hasMany(Teacher::class, 'department_id');
    }
}
