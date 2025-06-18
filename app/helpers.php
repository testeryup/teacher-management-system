<?php

if (!function_exists('str_slug')) {
    /**
     * Generate a URL friendly "slug" from a given string.
     */
    function str_slug($title, $separator = '-')
    {
        return \Illuminate\Support\Str::slug($title, $separator);
    }
}

if (!function_exists('safe_number')) {
    /**
     * Safely convert value to number
     */
    function safe_number($value, $default = 0)
    {
        return is_numeric($value) ? (float)$value : $default;
    }
}

if (!function_exists('safe_currency')) {
    /**
     * Format currency for Vietnam
     */
    function safe_currency($value)
    {
        $num = safe_number($value);
        return number_format($num, 0, ',', '.') . ' ₫';
    }
}