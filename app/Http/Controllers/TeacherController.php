<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Department;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
        
        // Check if teacher has user account for email validation
        $teacherUser = User::where('email', $teacher->email)->first();
        
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'DOB' => 'required|date',
            'phone' => [
                'required',
                'string',
                'regex:/^[0-9]{10,11}$/',
                Rule::unique('teachers', 'phone')->ignore($teacher->id)
            ],
            'email' => [
                'required',
                'string',
                'max:255',  
                'email',
                Rule::unique('teachers', 'email')->ignore($teacher->id),
                // FIX: Simplified email validation for users table
                Rule::unique('users', 'email')->ignore($teacherUser?->id)
            ],
            'degree_id' => 'required|exists:degrees,id',
            'department_id' => 'required|exists:departments,id',
            'password' => 'nullable|string|min:8|confirmed'
        ], [
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.regex' => 'Số điện thoại chỉ được chứa số và có độ dài 10-11 chữ số',
            'phone.unique' => 'Số điện thoại này đã được sử dụng',
            'email.unique' => 'Email này đã được sử dụng',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp',
        ]);
        
        // Permission check for department head
        if ($user->isDepartmentHead()) {
            // Check current teacher's department
            if ($teacher->department_id != $user->department_id) {
                return back()->withErrors(['permission' => 'Bạn chỉ có thể sửa giáo viên trong khoa của mình']);
            }
            
            // Check new department (if changing)
            if ($validated['department_id'] != $user->department_id) {
                return back()->withErrors(['department_id' => 'Bạn không thể chuyển giáo viên sang khoa khác']);
            }
        }
        
        try {
            DB::beginTransaction();
            
            // Update teacher
            $teacher->update([
                'fullName' => $validated['fullName'],
                'DOB' => $validated['DOB'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'degree_id' => $validated['degree_id'],
                'department_id' => $validated['department_id'],
            ]);
            
            // FIX: Update user account if exists
            if ($teacherUser) {
                $userUpdateData = [
                    'name' => $validated['fullName'],
                    'email' => $validated['email'],
                    'department_id' => $validated['department_id'],
                ];
                
                // FIX: Only update password if provided
                if (!empty($validated['password'])) {
                    $userUpdateData['password'] = Hash::make($validated['password']);
                }
                
                $teacherUser->update($userUpdateData);
            }
            
            DB::commit();
            
            return redirect()->route('teachers.index')
                ->with('message', 'Thông tin giáo viên đã cập nhật thành công');
        } catch (\Exception $e) {
            DB::rollBack();
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
                'regex:/^[0-9]{10,11}$/',
                'unique:teachers,phone'
            ],
            'email' => [
                'required',
                'string',
                'max:255',
                'email',
                'unique:teachers,email',
                'unique:users,email'
            ],
            'degree_id' => 'required|exists:degrees,id',
            'department_id' =>'required|exists:departments,id',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:teacher,department_head,accountant'
        ], [
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.regex' => 'Số điện thoại chỉ được chứa số và có độ dài 10-11 chữ số',
            'phone.unique' => 'Số điện thoại này đã được sử dụng',
            'email.unique' => 'Email này đã được sử dụng',
            'password.required' => 'Mật khẩu là bắt buộc',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp',
            'fullName.required' => 'Họ tên là bắt buộc',
            'DOB.required' => 'Ngày sinh là bắt buộc',
            'degree_id.required' => 'Bằng cấp là bắt buộc',
            'department_id.required' => 'Khoa là bắt buộc',
            'role.in' => 'Vai trò không hợp lệ'
        ]);

        // Permission check for department head
        if ($user->isDepartmentHead() && $validated['department_id'] != $user->department_id) {
            return back()->withErrors(['department_id' => 'Bạn chỉ có thể tạo giáo viên trong khoa của mình']);
        }

        try {
            DB::beginTransaction();
            
            // Create teacher
            $teacher = Teacher::create([
                'fullName' => $validated['fullName'],
                'DOB' => $validated['DOB'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'degree_id' => $validated['degree_id'],
                'department_id' => $validated['department_id'],
            ]);

            // Create user account
            User::create([
                'name' => $validated['fullName'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'department_id' => $validated['department_id']
            ]);

            DB::commit();

            return redirect()->route('teachers.index')->with('message', 'Thêm giáo viên và tài khoản thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Không thể thêm giáo viên: ' . $e->getMessage()]);
        }
    }

    public function destroy(Teacher $teacher){
        $user = auth()->user();
        
        // Permission check for department head
        if ($user->isDepartmentHead()) {
            if ($teacher->department_id != $user->department_id) {
                return back()->withErrors(['permission' => 'Bạn chỉ có thể xoá giáo viên trong khoa của mình']);
            }
        }
        
        // Check if teacher has any dependent relationships (classrooms)
        if ($teacher->classrooms()->count() > 0) {
            return back()->withErrors(['reference' => 'Không thể xóa giáo viên này vì đang được phân công dạy ' . 
                $teacher->classrooms()->count() . ' lớp học']);
        }
        
        try {
            DB::beginTransaction();
            
            $email = $teacher->email;
            
            // Delete teacher
            $teacher->delete();
            
            // Delete associated user account if exists
            $teacherUser = User::where('email', $email)->first();
            if($teacherUser){
                $teacherUser->delete();
            }
            
            DB::commit();
            
            return redirect()->route('teachers.index')->with('message', 'Xoá giáo viên thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Không thể xoá giáo viên: ' . $e->getMessage()]);
        }
    }
}