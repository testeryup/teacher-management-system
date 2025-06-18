<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Department;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    public function index(){
        $user = auth()->user();
        if($user->isAdmin()){
            $teachers = Teacher::with(['degree', 'department'])->paginate(10);
        }
        else{
            $teachers = Teacher::with(['degree', 'department'])
                ->where('department_id', $user->department_id)
                ->paginate(10);
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
            'phone' => [
                'required',
                'string',
                'regex:/^[0-9]{10,11}$/',
                Rule::unique('teachers', 'phone')->ignore($teacher->id)  // FIX: Ignore current record
            ],
            'email' => [
                'required',
                'string',
                'max:255',  
                'email',
                Rule::unique('teachers', 'email')->ignore($teacher->id)  // FIX: Ignore current record
            ],
            'degree_id' => 'required|exists:degrees,id',
            'department_id' => 'required|exists:departments,id'
        ], [
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.regex' => 'Số điện thoại chỉ được chứa số và có độ dài 10-11 chữ số',
            'phone.unique' => 'Số điện thoại này đã được sử dụng',
            'email.unique' => 'Email này đã được sử dụng',
        ]);
        
        if ($user->isDepartmentHead() && $teacher->department_id != $user->department_id && $validated['department_id'] != $user->department_id) {
            return back()->withErrors(['department_id' => 'Bạn chỉ có thể sửa giáo viên trong khoa của mình']);
        }
        
        try {
            $teacher->update($validated);
            return redirect()->route('teachers.index')
                ->with('message', 'Thông tin giáo viên đã cập nhật thành công');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể cập nhật giáo viên: ' . $e->getMessage()]);
        }
    }

    public function store(Request $request){
        $user = auth()->user();

        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => [
                'required',
                'string',
                'regex:/^[0-9]{10,11}$/',  // FIX: Chỉ cho phép số, 10-11 chữ số
                'unique:teachers,phone'    // FIX: Không trùng SDT
            ],
            'email' => [
                'required',
                'string',
                'max:255',
                'email',
                'unique:teachers,email'    // FIX: Không trùng email
            ],
            'degree_id' => 'required|exists:degrees,id',
            'department_id' =>'required|exists:departments,id'
        ], [
            // FIX: Custom error messages
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.regex' => 'Số điện thoại chỉ được chứa số và có độ dài 10-11 chữ số',
            'phone.unique' => 'Số điện thoại này đã được sử dụng',
            'email.unique' => 'Email này đã được sử dụng',
            'fullName.required' => 'Họ tên là bắt buộc',
            'DOB.required' => 'Ngày sinh là bắt buộc',
            'degree_id.required' => 'Bằng cấp là bắt buộc',
            'department_id.required' => 'Khoa là bắt buộc',
        ]);

        if ($user->isDepartmentHead() && $validated['department_id'] != $user->department_id) {
            return back()->withErrors(['department_id' => 'Bạn chỉ có thể tạo giáo viên trong khoa của mình']);
        }

        try {
            Teacher::create($validated);
            return redirect()->route('teachers.index')
                ->with('message', 'Giáo viên đã được thêm thành công');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể tạo giáo viên: ' . $e->getMessage()]);
        }
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
