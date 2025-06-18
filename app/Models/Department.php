<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'name',
        'abbrName'
    ];

    // FIX: Add validation rules method
    public static function rules($id = null)
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                $id ? "unique:departments,name,{$id}" : 'unique:departments,name'
            ],
            'abbrName' => [
                'required',
                'string',
                'max:10',
                $id ? "unique:departments,abbrName,{$id}" : 'unique:departments,abbrName'
            ],
        ];
    }

    // FIX: Add custom error messages
    public static function messages()
    {
        return [
            'name.required' => 'Tên khoa là bắt buộc',
            'name.unique' => 'Tên khoa này đã tồn tại',
            'name.max' => 'Tên khoa không được vượt quá 255 ký tự',
            'abbrName.required' => 'Tên viết tắt là bắt buộc',
            'abbrName.unique' => 'Tên viết tắt này đã tồn tại',
            'abbrName.max' => 'Tên viết tắt không được vượt quá 10 ký tự',
        ];
    }

    // Relationships
    public function teachers(): HasMany
    {
        return $this->hasMany(Teacher::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    // FIX: Add scopes để check duplicate
    public function scopeWithName($query, $name, $excludeId = null)
    {
        $query = $query->where('name', $name);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query;
    }

    public function scopeWithAbbrName($query, $abbrName, $excludeId = null)
    {
        $query = $query->where('abbrName', $abbrName);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query;
    }
}
