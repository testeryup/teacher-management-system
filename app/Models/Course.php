<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Classroom;
use App\Models\Department;
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
        'department_id',
        'course_coefficient'
    ];

    protected $casts = [
        'course_coefficient' => 'decimal:1',
    ];


    public static function rules($id = null)
    {
        return [
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1|max:10',
            'lessons' => 'required|integer|min:1|max:100',
            'code' => 'nullable|string|max:10|unique:courses,code' . ($id ? ",$id" : ''),
            'department_id' => 'nullable|integer',
            'course_coefficient' => 'nullable|numeric|min:1.0|max:1.5',
        ];
    }
    
    public function classrooms(){
        return $this->hasMany(Classroom::class, 'course_id');
    }

    public function department(): BelongsTo{
        return $this->belongsTo(Department::class);
    }
}
