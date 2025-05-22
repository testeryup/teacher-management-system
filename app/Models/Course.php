<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Classroom;
use App\AutoGenerateCode;

class Course extends Model
{
    use AutoGenerateCode;

    protected $codePrefix = 'CS';
    protected $codeColumn = 'code';
    
    protected $fillable = [
        'name',
        'credits',
        'lessions',
        // 'code'
    ];

    public function classroom(){
        return $this->hasMany(Classroom::class, 'course_id');
    }
}
