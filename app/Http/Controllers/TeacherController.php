<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Department;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TeacherController extends Controller
{
    public function index(){
        $user = Auth::user();
        
        // Get departments based on user role
        $departments = Department::all();
        
        // Get degrees for all users
        $degrees = Degree::all();
        
        // Filter teachers based on user role and department
        if ($user->isAdmin()) {
            // Admins can see all teachers
            $teachers = Teacher::with(['degree', 'department'])->get();
        } elseif ($user->isDepartmentHead() && $user->department_id) {
            // Department heads can only see teachers in their department
            $teachers = Teacher::with(['degree', 'department'])
                ->where('department_id', $user->department_id)
                ->get();
        } else {
            // Other users (regular teachers) can't access this page
            // This should be handled by middleware, but just in case
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }
        
        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'degrees' => $degrees,
            'departments' => $departments
        ]);
    }

    
    public function update(Request $request, Teacher $teacher){
        $user = Auth::user();
        
        // Validate the request
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => 'required|string|max:10',
            'email' => 'required|string|max:255|email',
            'degree_id' => 'required|exists:degrees,id',
            'department_id' => 'required|exists:departments,id'
        ]);
        
        // For department heads, check if the teacher belongs to their department
        // and ensure department cannot be changed
        if ($user->isDepartmentHead()) {
            if ($teacher->department_id != $user->department_id) {
                return redirect()->route('teachers.index')
                    ->with('error', 'You can only update teachers in your department');
            }
            
            // Force department to remain unchanged
            $validated['department_id'] = $user->department_id;
        }
        
        $teacher->update($validated);
        
        return redirect()->route('teachers.index')
            ->with('message', 'Thông tin giáo viên đã cập nhật thành công');
    }

    public function store(Request $request){
        $user = Auth::user();
        
        // Validate the request
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => 'required|string|max:10',
            'email' => 'required|string|max:255|email',
            'degree_id' => 'required|exists:degrees,id',
            'department_id' =>'required|exists:departments,id'
        ]);
        
        // For department heads, force the department_id to be their own department
        if ($user->isDepartmentHead()) {
            $validated['department_id'] = $user->department_id;
        }
        
        // Create the teacher
        Teacher::create($validated);
        
        return redirect()->route('teachers.index')
            ->with('message', 'Giáo viên đã được tạo thành công');
    }

    public function destroy(Teacher $teacher){
        $user = Auth::user();
        
        // For department heads, check if the teacher belongs to their department
        if ($user->isDepartmentHead() && $teacher->department_id != $user->department_id) {
            return redirect()->route('teachers.index')
                ->with('error', 'You can only delete teachers in your department');
        }
        
        $teacher->delete();
        return redirect()->route('teachers.index')
            ->with('message', 'Xoá giáo viên thành công');
    }
}
