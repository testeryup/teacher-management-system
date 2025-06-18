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

    protected $casts = [
        'baseSalaryFactor' => 'decimal:2',
    ];

    public function teachers(){
        return $this->hasMany(Teacher::class, 'degree_id');
    }

    public static function rules($id = null)
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                $id ? "unique:degrees,name,{$id}" : 'unique:degrees,name'
            ],
            'baseSalaryFactor' => [
                'required',
                'numeric',
                'min:0.1',
                'max:5.0'
            ],
        ];
    }

    // FIX: Add custom error messages
    public static function messages()
    {
        return [
            'name.required' => 'Tên bằng cấp là bắt buộc',
            'name.unique' => 'Tên bằng cấp này đã tồn tại',
            'name.max' => 'Tên bằng cấp không được vượt quá 255 ký tự',
            'baseSalaryFactor.required' => 'Hệ số lương là bắt buộc',
            'baseSalaryFactor.numeric' => 'Hệ số lương phải là số',
            'baseSalaryFactor.min' => 'Hệ số lương phải lớn hơn 0',
            'baseSalaryFactor.max' => 'Hệ số lương không được vượt quá 5.0',
        ];
    }

    // FIX: Add scope để check duplicate
    public function scopeWithName($query, $name, $excludeId = null)
    {
        $query = $query->where('name', $name);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query;
    }
}
