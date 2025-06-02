<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Department;
use App\Models\Degree;

class DepartmentHeadController extends Controller
{
    /**
     * Display department head dashboard with relevant information
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        // Ensure user is a department head
        if (!$user->isDepartmentHead() || !$user->department_id) {
            return redirect()->route('dashboard')
                ->with('error', 'Only department heads can access this dashboard');
        }
        
        $department = Department::findOrFail($user->department_id);
        
        // Get teachers in this department
        $teachers = Teacher::with(['degree'])
            ->where('department_id', $user->department_id)
            ->get();
            
        // Get classrooms assigned to teachers in this department
        $classrooms = Classroom::with(['course', 'semester.academicYear', 'teacher'])
            ->whereHas('teacher', function($q) use ($user) {
                $q->where('department_id', $user->department_id);
            })
            ->get();
            
        // Get statistics
        $stats = [
            'teacherCount' => $teachers->count(),
            'assignedClassroomsCount' => $classrooms->count(),
            'unassignedTeacherCount' => $teachers->filter(function($teacher) {
                return $teacher->classrooms->count() === 0;
            })->count(),
        ];
        
        return Inertia::render('DepartmentHead/Dashboard', [
            'department' => $department,
            'teachers' => $teachers,
            'classrooms' => $classrooms,
            'stats' => $stats,
        ]);
    }
      /**
     * Display teachers in this department head's department
     */
    public function teachers()
    {
        $user = Auth::user();
        
        // Ensure user is a department head
        if (!$user->isDepartmentHead() || !$user->department_id) {
            return redirect()->route('dashboard')
                ->with('error', 'Only department heads can access this page');
        }
        
        $department = Department::findOrFail($user->department_id);
        $degrees = Degree::all(); // Get all degrees for the form
        
        // Get teachers in this department with their classrooms count
        $teachers = Teacher::with(['degree', 'classrooms'])
            ->where('department_id', $user->department_id)
            ->get()
            ->map(function($teacher) {
                $teacher->classrooms_count = $teacher->classrooms->count();
                return $teacher;
            });
            
        return Inertia::render('DepartmentHead/Teachers', [
            'department' => $department,
            'teachers' => $teachers,
            'degrees' => $degrees,
        ]);
    }
    
    /**
     * Display classrooms assigned to teachers in this department
     */
    public function classrooms()
    {
        $user = Auth::user();
        
        // Ensure user is a department head
        if (!$user->isDepartmentHead() || !$user->department_id) {
            return redirect()->route('dashboard')
                ->with('error', 'Only department heads can access this page');
        }
        
        $department = Department::findOrFail($user->department_id);
        
        // Get classrooms assigned to teachers in this department
        $classrooms = Classroom::with(['course', 'semester.academicYear', 'teacher'])
            ->whereHas('teacher', function($q) use ($user) {
                $q->where('department_id', $user->department_id);
            })
            ->get();
            
        // Get all teachers in the department for assignment
        $teachers = Teacher::where('department_id', $user->department_id)->get();
        
        return Inertia::render('DepartmentHead/Classrooms', [
            'department' => $department,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
        ]);
    }
}
