<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use Illuminate\Http\Response;
use App\Models\Degree;
use App\Models\Teacher;
use App\Models\Department;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(){
        $teacherDegrees = Degree::withCount('teachers')->get();

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

        return Inertia::render('dashboard', [
            'departments' => $teacherCountByDepartment,
            'teacherDegrees' => $teacherDegrees
        ]);
    }

    public function apiIndex(){
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
            'departments' => $teacherCountByDepartment
        ], 200);
    }
}
