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
        'code',
        'credits',
        'lessons',
        'course_coefficient',
    ];

    public static function rules($id = null)
    {
        return [
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1|max:10',
            'lessons' => 'required|integer|min:1|max:100',
            'code' => 'nullable|string|max:10|unique:courses,code' . ($id ? ",$id" : ''),
            'course_coefficient' => 'nullable|numeric|between:1.0,1.5',
        ];
    }
    
    public function classrooms(){
        return $this->hasMany(Classroom::class, 'course_id');
    }
}
