<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 
use App\Models\Classroom;
use App\AutoGenerateCode;

class Course extends Model
{
    use HasFactory; 
    use AutoGenerateCode;

    protected $codePrefix = 'CS';
    protected $codeColumn = 'code';
    
    protected $fillable = [
        'name',
        'code',
        'credits',
        'lessons',
    ];

    public static function rules($id = null)
    {
        return [
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1|max:10',
            'lessons' => 'required|integer|min:1|max:100',
            'code' => 'nullable|string|max:10|unique:courses,code' . ($id ? ",$id" : ''),
        ];
    }
    
    public function classrooms(){
        return $this->hasMany(Classroom::class, 'course_id');
    }
}
