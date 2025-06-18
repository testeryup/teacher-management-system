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
            'name' => [
                'required',
                'string',
                'max:255',
                $id ? "unique:courses,name,{$id}" : 'unique:courses,name'
            ],
            'code' => [
                'required',
                'string',
                'max:10',
                $id ? "unique:courses,code,{$id}" : 'unique:courses,code'
            ],
            'credits' => 'required|integer|min:1|max:10',
            'lessons' => 'required|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'course_coefficient' => 'required|numeric|min:1.0|max:1.5',
        ];
    }

    public static function messages()
    {
        return [
            'name.required' => 'Tên môn học là bắt buộc',
            'name.unique' => 'Tên môn học này đã tồn tại',
            'code.required' => 'Mã môn học là bắt buộc',
            'code.unique' => 'Mã môn học này đã tồn tại',
            'credits.required' => 'Số tín chỉ là bắt buộc',
            'lessons.required' => 'Số tiết học là bắt buộc',
            'course_coefficient.required' => 'Hệ số môn học là bắt buộc',
            'course_coefficient.min' => 'Hệ số môn học phải từ 1.0 trở lên',
            'course_coefficient.max' => 'Hệ số môn học không được vượt quá 1.5',
        ];
    }
    
    public function classrooms(){
        return $this->hasMany(Classroom::class, 'course_id');
    }

    public function department(): BelongsTo{
        return $this->belongsTo(Department::class);
    }
}
