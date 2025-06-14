<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Department;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(){
        $user = auth()->user();
        if($user->isAdmin()){
            $teachers = Teacher::with(['degree', 'department'])->get();
        }
        else{
            $teachers = Teacher::with(['degree', 'department'])
                ->where('department_id', $user->department_id)
                ->get();
        }
        if($user->isAdmin()){
            $degrees = Degree::all();
            $departments = Department::all();
        }
        else{
            $departments = Department::where('id', $user->department_id)->get();
            $degrees = Degree::all(); 
        }
        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'degrees' => $degrees,
            'departments' => $departments
        ]);
    }

    
    public function update(Request $request, Teacher $teacher){
        $user = auth()->user();
        
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => 'required|string|max:10',
            'email' => 'required|string|max:255|email',
            'degree_id' => 'required|exists:degrees,id',
            'department_id' => 'required|exists:departments,id'
        ]);
        if ($user->isDepartmentHead() && $teacher['department_id'] != $user->department_id && $validated['department_id'] != $user->department_id) {
            return back()->withErrors(['department_id' => 'Bạn chỉ có thể sửa giáo viên trong khoa của mình']);
        }
        $teacher->update($validated);
        
        return redirect()->route('teachers.index')->with('message', 'Thông tin giáo viên đã cập nhật thành công');
    }

    public function store(Request $request){
        $user = auth()->user();

        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => 'required|string|max:10',
            'email' => 'required|string|max:255|email',
            'degree_id' => 'required|exists:degrees,id',
            'department_id' =>'required|exists:departments,id'
        ]);

        if ($user->isDepartmentHead() && $validated['department_id'] != $user->department_id) {
            return back()->withErrors(['department_id' => 'Bạn chỉ có thể tạo giáo viên trong khoa của mình']);
        }

        Teacher::create($validated);
        
        return redirect()->route('teachers.index')->with('message', 'Giáo viên đã được thêm thành công');
    }

    public function destroy(Teacher $teacher){
        $user = auth()->user();
        
        // If user is department head, check if teacher belongs to their department
        if ($user->isDepartmentHead()) {
            if ($teacher->department_id != $user->department_id) {
                return back()->withErrors(['department_id' => 'Bạn chỉ có thể xoá giáo viên trong khoa của mình']);
            }
        }
        
        // Check if teacher has any dependent relationships (classrooms)
        if ($teacher->classrooms()->count() > 0) {
            return back()->withErrors(['reference' => 'Không thể xóa giáo viên này vì đang được phân công dạy ' . 
                $teacher->classrooms()->count() . ' lớp học']);
        }
        
        $teacher->delete();
        return redirect()->route('teachers.index')->with('message', 'Xoá giáo viên thành công');
    }
}
