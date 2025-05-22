<?php

namespace App;
use Illuminate\Support\Facades\DB;

trait AutoGenerateCode
{
    public static function bootAutoGenerateCode()
    {
        static::creating(function ($model) {
            $prefix = $model->codePrefix ?? 'XX'; // VD: GV, MH, LH
            $column = $model->codeColumn ?? 'code'; // Mặc định là 'code'

            $lastCode = DB::table($model->getTable())
                ->select($column)
                ->where($column, 'like', "$prefix%")
                ->orderByDesc($column)
                ->first();

            $nextNumber = $lastCode
                ? intval(substr($lastCode->$column, strlen($prefix))) + 1
                : 1;

            $model->$column = $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        });
    }
}
