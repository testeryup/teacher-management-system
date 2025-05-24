<?php

namespace App;

use Illuminate\Support\Facades\DB;

trait AutoGenerateCode
{
    public static function bootAutoGenerateCode()
    {
        static::creating(function ($model) {
            // Only generate if code is not already set
            $column = $model->codeColumn ?? 'code';
            
            if (!empty($model->$column)) {
                return; // Code already set, skip auto-generation
            }

            $prefix = $model->codePrefix ?? 'XX';
            
            // Get the last code with this prefix
            $lastCode = DB::table($model->getTable())
                ->select($column)
                ->where($column, 'like', $prefix . '%')
                ->orderByDesc($column)
                ->first();

            $nextNumber = 1;
            if ($lastCode) {
                $currentNumber = intval(substr($lastCode->$column, strlen($prefix)));
                $nextNumber = $currentNumber + 1;
            }

            $model->$column = $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        });
    }
}