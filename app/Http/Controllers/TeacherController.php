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
        $teachers = Teacher::with(['degree', 'department'])->get();
        $degrees = Degree::all();
        $departments = Department::all();
        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'degrees' => $degrees,
            'departments' => $departments
        ]);
    }

    
    public function update(Request $request, Teacher $teacher){
        $request->validate([
        'fullName' => 'required|string|max:255',
        'DOB' => 'required|date',
        'phone' => 'required|string|max:10|unique:teachers,phone,' . $teacher->id,
        'email' => 'required|string|email|max:255|unique:teachers,email,' . $teacher->id,
        'degree_id' => 'required|exists:degrees,id',
        'department_id' => 'required|exists:departments,id'
    ]);
        $teacher->update($request->all());
        
        return redirect()->route('teachers.index')->with('message', 'Thông tin giáo viên đã cập nhật thành công');
    }

    public function store(Request $request){
        // dd($request);
        // return;
        $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => 'required|string|max:10|unique:teachers,phone',
            'email' => 'required|string|email|max:255|unique:teachers,email',
            'degree_id' => 'required|exists:degrees,id',
            'department_id' => 'required|exists:departments,id'
        ]);
        Teacher::create([
            'fullName' => $request->fullName,
            'DOB' => $request->DOB,
            'phone' => $request->phone,
            'email' => $request->email,
            'degree_id' => $request->degree_id, // Note the field name change
            'department_id' => $request->department_id // Note the field name change
        ]);
        
        return redirect()->route('teachers.index')->with('message', 'Giáo viên đã được thêm thành công');
    }

    public function destroy(Teacher $teacher){
        $teacher->delete();
        return redirect()->route('teachers.index')->with('message', 'Xoá giáo viên thành công');
    }
}
