<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use Illuminate\Http\Response;
use App\Models\Degree;
use App\Models\Teacher;
use App\Models\Department;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(){
        $insight = Degree::withCount('teachers')->get();

        $teacherAgeByDepartment = Department::with('teachers')->get()->map(function ($dept) {
            $ages = $dept->teachers->map(function ($teacher) {
                return Carbon::parse($teacher->DOB)->age;
            });

            return [
                'department' => $dept->name,
                'average_age' => round($ages->avg(), 1),
            ];
        });

        $teacherCountByDepartment = Department::withCount('teachers')->get();

        return response()->json([
            'insight' => $insight, 
            'teachers_age_by_department' => $teacherAgeByDepartment,
            'teachers_count_by_department' => $teacherCountByDepartment
        ], 200);
    }
}
