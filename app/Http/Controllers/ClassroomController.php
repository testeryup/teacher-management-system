<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Course;
use App\Models\Semester;
use App\Models\Teacher;
use App\Models\AcademicYear;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    /**
     * Display a listing of the classrooms.
     */
    public function index()
    {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            // Admin xem tất cả lớp học
            $classrooms = Classroom::with(['course.department', 'semester.academicYear', 'teacher.department'])->paginate(10);
            $courses = Course::with('department')->get();
            $teachers = Teacher::with(['department', 'degree'])->get();
        } else if ($user->isDepartmentHead()) {
            // Trưởng khoa chỉ xem lớp học thuộc khoa của mình
            $classrooms = Classroom::with(['course.department', 'semester.academicYear', 'teacher.department'])
                ->whereHas('course', function ($query) use ($user) {
                    $query->where('department_id', $user->department_id);
                })
                ->paginate(10);
            
            // Chỉ lấy môn học thuộc khoa của trưởng khoa
            $courses = Course::with('department')
                ->where('department_id', $user->department_id)
                ->get();
            
            // Chỉ lấy giáo viên thuộc khoa của trưởng khoa
            $teachers = Teacher::with(['department', 'degree'])
                ->where('department_id', $user->department_id)
                ->get();
        } else {
            // User thường không có quyền truy cập
            abort(403, 'Bạn không có quyền truy cập trang này.');
        }
        
        $academicYears = AcademicYear::all();
        $semesters = Semester::with('academicYear')->get();
        
        return Inertia::render('Classrooms', [
            'classrooms' => $classrooms,
            'courses' => $courses,
            'academicYears' => $academicYears,
            'semesters' => $semesters,
            'teachers' => $teachers,
        ]);
    }

    public function bulkStore(Request $request)
    {
        try {
            $user = auth()->user();
            
            $validated = $request->validate([
                'course_id' => 'required|integer|exists:courses,id',
                'semester_id' => 'required|integer|exists:semesters,id',
                'teacher_id' => 'nullable|integer|exists:teachers,id',
                'students_per_class' => 'required|integer|min:1|max:200',
                'number_of_classes' => 'required|integer|min:1|max:20',
                'class_name_prefix' => 'required|string|max:50',
            ]);
            
            // Kiểm tra quyền tạo lớp học cho trưởng khoa
            if ($user->isDepartmentHead()) {
                $course = Course::find($validated['course_id']);
                if (!$course || $course->department_id != $user->department_id) {
                    return back()->withErrors(['course_id' => 'Bạn chỉ có thể tạo lớp học cho môn học thuộc khoa của mình']);
                }
                
                // Kiểm tra giáo viên (nếu có)
                if ($validated['teacher_id']) {
                    $teacher = Teacher::find($validated['teacher_id']);
                    if (!$teacher || $teacher->department_id != $user->department_id) {
                        return back()->withErrors(['teacher_id' => 'Bạn chỉ có thể chọn giáo viên thuộc khoa của mình']);
                    }
                }
            }
            
            $createdClasses = [];
            $course = Course::find($validated['course_id']);
            $semester = Semester::find($validated['semester_id']);
            
            // Tạo nhiều lớp học
            for ($i = 1; $i <= $validated['number_of_classes']; $i++) {
                $className = $validated['class_name_prefix'] . ' ' . 'N' . str_pad($i, 2, '0', STR_PAD_LEFT);
                
                // Kiểm tra trùng tên lớp
                $duplicateCheck = Classroom::where('name', $className)
                    ->where('semester_id', $validated['semester_id'])
                    ->where('course_id', $validated['course_id'])
                    ->first();
                    
                if ($duplicateCheck) {
                    return back()->withErrors(['class_name_prefix' => "Lớp học '{$className}' đã tồn tại trong học kỳ này"]);
                }
                
                $classroom = Classroom::create([
                    'name' => $className,
                    'semester_id' => $validated['semester_id'],
                    'course_id' => $validated['course_id'],
                    'teacher_id' => $validated['teacher_id'],
                    'students' => $validated['students_per_class'],
                ]);
                
                $createdClasses[] = $classroom;
            }
            
            return redirect()->route('classrooms.index')
                ->with('message', 'Đã tạo thành công ' . count($createdClasses) . ' lớp học cho môn ' . $course->name);
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể tạo lớp học hàng loạt: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Filter classrooms by academic year, semester, and course.
     */
    public function filter(Request $request)
    {
        $user = auth()->user();
        $semester_id = $request->input('semester_id');
        
        $query = Classroom::with(['course.department', 'semester.academicYear', 'teacher.department']);
        
        // Lọc theo quyền user
        if ($user->isDepartmentHead()) {
            $query->whereHas('course', function ($q) use ($user) {
                $q->where('department_id', $user->department_id);
            });
        }
        
        // Lọc theo semester nếu có
        if ($semester_id) {
            $query->where('semester_id', $semester_id);
        }
        
        $classrooms = $query->get();
        
        return response()->json([
            'classrooms' => $classrooms
        ]);
    }

    /**
     * Store a newly created classroom in storage.
     */
    public function store(Request $request)
    {
        try {
            $user = auth()->user();
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'semester_id' => 'required|integer|exists:semesters,id',
                'course_id' => 'required|integer|exists:courses,id',
                'teacher_id' => 'nullable|integer|exists:teachers,id',
                'students' => 'required|integer|min:0|max:200',
            ]);
            
            // Kiểm tra quyền tạo lớp học cho trưởng khoa
            if ($user->isDepartmentHead()) {
                $course = Course::find($validated['course_id']);
                if (!$course || $course->department_id != $user->department_id) {
                    return back()->withErrors(['course_id' => 'Bạn chỉ có thể tạo lớp học cho môn học thuộc khoa của mình']);
                }
                
                // Kiểm tra giáo viên (nếu có)
                if ($validated['teacher_id']) {
                    $teacher = Teacher::find($validated['teacher_id']);
                    if (!$teacher || $teacher->department_id != $user->department_id) {
                        return back()->withErrors(['teacher_id' => 'Bạn chỉ có thể chọn giáo viên thuộc khoa của mình']);
                    }
                }
            }
            
            $classroom = Classroom::create($validated);
            
            return redirect()->route('classrooms.index')
                ->with('message', 'Lớp học đã được tạo thành công');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể tạo lớp học: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Update the specified classroom in storage.
     */
    public function update(Request $request, Classroom $classroom)
    {
        try {
            $user = auth()->user();
            
            // Kiểm tra quyền sửa lớp học cho trưởng khoa
            if ($user->isDepartmentHead()) {
                $course = $classroom->course;
                if (!$course || $course->department_id != $user->department_id) {
                    return back()->withErrors(['permission' => 'Bạn chỉ có thể sửa lớp học thuộc khoa của mình']);
                }
            }
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'teacher_id' => 'required|integer|exists:teachers,id',
                'students' => 'required|integer|min:0',
            ]);
            
            // Kiểm tra giáo viên cho trưởng khoa
            if ($user->isDepartmentHead()) {
                $teacher = Teacher::find($validated['teacher_id']);
                if (!$teacher || $teacher->department_id != $user->department_id) {
                    return back()->withErrors(['teacher_id' => 'Bạn chỉ có thể chọn giáo viên thuộc khoa của mình']);
                }
            }
            
            $classroom->update($validated);
            
            return redirect()->route('classrooms.index')
                ->with('message', 'Lớp học đã được cập nhật thành công');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể cập nhật lớp học: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified classroom from storage.
     */
    public function destroy(Classroom $classroom)
    {
        try {
            $user = auth()->user();
            
            // Kiểm tra quyền xóa lớp học cho trưởng khoa
            if ($user->isDepartmentHead()) {
                $course = $classroom->course;
                if (!$course || $course->department_id != $user->department_id) {
                    return back()->withErrors(['permission' => 'Bạn chỉ có thể xóa lớp học thuộc khoa của mình']);
                }
            }
            
            $classroom->delete();
            return redirect()->route('classrooms.index')
                ->with('message', 'Lớp học đã được xóa thành công');
        } catch (\Exception $e) {
            return redirect()->route('classrooms.index')
                ->with('error', 'Không thể xóa lớp học: ' . $e->getMessage());
        }
    }
}