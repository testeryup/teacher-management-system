<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Department;
use Inertia\Inertia;
use Exception;

class CourseController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Load courses with department relationship
        if ($user->isAdmin()) {
            $courses = Course::with('department')->paginate(10);
            $departments = Department::all();
        } else {
            // Department heads only see courses from their department
            $courses = Course::with('department')
                ->where('department_id', $user->department_id)
                ->paginate(10);
            $departments = Department::where('id', $user->department_id)->get();
        }
        
        return Inertia::render('Courses', [
            'courses' => $courses,
            'departments' => $departments
        ]);
    }

    public function store(Request $request)
    {
        try {
            $user = auth()->user();
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'credits' => 'required|integer|min:1|max:10',
                'lessons' => 'required|integer|min:1',
                'department_id' => 'nullable|exists:departments,id',
                'course_coefficient' => 'required|numeric|min:1.0|max:1.5',
            ]);

            // Kiểm tra quyền tạo môn học cho trưởng khoa
            if ($user->isDepartmentHead()) {
                if ($validated['department_id'] && $validated['department_id'] != $user->department_id) {
                    return back()->withErrors(['department_id' => 'Bạn chỉ có thể tạo môn học cho khoa của mình']);
                } else {
                    $validated['department_id'] = $user->department_id;
                }
            }

            Course::create($validated);

            return redirect()->route('courses.index')
                ->with('message', 'Môn học đã được tạo thành công');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể tạo môn học: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(Request $request, Course $course)
    {
        try {
            $user = auth()->user();
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'credits' => 'required|integer|min:1|max:10',
                'lessons' => 'required|integer|min:1',
                'department_id' => 'nullable|exists:departments,id',
                'course_coefficient' => 'required|numeric|min:1.0|max:1.5',
            ]);
            
            // Kiểm tra quyền sửa môn học cho trưởng khoa
            if ($user->isDepartmentHead()) {
                if ($course->department_id != $user->department_id) {
                    return back()->withErrors(['department_id' => 'Bạn chỉ có thể sửa môn học trong khoa của mình']);
                }
                
                if ($validated['department_id'] && $validated['department_id'] != $user->department_id) {
                    return back()->withErrors(['department_id' => 'Bạn không thể chuyển môn học sang khoa khác']);
                }
            }
            
            $course->update($validated);
            
            return redirect()->route('courses.index')
                ->with('message', 'Môn học đã được cập nhật thành công');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể cập nhật môn học: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course)
    {
        try {
            $user = auth()->user();
            
            // Department heads can only delete courses in their department
            if ($user->isDepartmentHead() && $course->department_id != $user->department_id) {
                return back()->withErrors(['department_id' => 'Bạn chỉ có thể xóa môn học trong khoa của mình']);
            }
            
            if ($course->classrooms()->count() > 0) {
                throw new Exception("Không thể xóa môn học đang có lớp học");
            }
            
            $course->delete();
            return redirect()->route('courses.index')
                ->with('message', 'Môn học đã được xóa thành công');
        } catch (\Throwable $th) {
            return redirect()->route('courses.index')
                ->with('error', 'Không thể xóa môn học: ' . $th->getMessage());
        }
    }
}