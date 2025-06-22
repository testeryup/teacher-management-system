<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Course;
use App\Models\Semester;
use App\Models\Teacher;
use App\Models\AcademicYear;
use App\Models\SalaryConfig;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    /**
     * Display a listing of the classrooms.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // FIX: Get filter parameters
        $academicYearId = $request->get('academic_year_id');
        $semesterId = $request->get('semester_id');
        $search = $request->get('search');
        
        if ($user->isAdmin()) {
            $query = Classroom::with(['course.department', 'semester.academicYear', 'teacher.department']);
            
            // Get all data for admin
            $courses = Course::with('department')->get();
            $teachers = Teacher::with(['department', 'degree'])->get();
            $academicYears = AcademicYear::with('semesters')->get();
            $semesters = Semester::with('academicYear')->get();
            
        } elseif ($user->isDepartmentHead()) {
            $query = Classroom::with(['course.department', 'semester.academicYear', 'teacher.department'])
                ->whereHas('course', function ($query) use ($user) {
                    $query->where('department_id', $user->department_id);
                });
            
            // Filtered data for department head
            $courses = Course::with('department')
                ->where('department_id', $user->department_id)
                ->get();
            $teachers = Teacher::with(['department', 'degree'])
                ->where('department_id', $user->department_id)
                ->get();
            $academicYears = AcademicYear::with('semesters')->get();
            $semesters = Semester::with('academicYear')->get();
            
        } else {
            abort(403, 'Bạn không có quyền truy cập trang này.');
        }
        
        // Apply filters
        if ($academicYearId) {
            $query->whereHas('semester', function($q) use ($academicYearId) {
                $q->where('academicYear_id', $academicYearId);
            });
        }
        
        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('course', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%")
                           ->orWhere('code', 'like', "%{$search}%");
                  })
                  ->orWhereHas('teacher', function($subQ) use ($search) {
                      $subQ->where('fullName', 'like', "%{$search}%");
                  });
            });
        }
        
        $classrooms = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // FIX: ALWAYS pass filters object, even if empty
        return Inertia::render('Classrooms', [
            'classrooms' => $classrooms,
            'courses' => $courses,
            'academicYears' => $academicYears,
            'semesters' => $semesters,
            'teachers' => $teachers,
            // FIX: Always provide filters object
            'filters' => [
                'academic_year_id' => $academicYearId,
                'semester_id' => $semesterId,
                'search' => $search,
            ]
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

            $salaryConfig = SalaryConfig::where('semester_id', $validated['semester_id'])
                ->whereIn('status', ['active', 'closed'])
                ->first();
            if ($salaryConfig) {
                $semester = \App\Models\Semester::find($validated['semester_id']);
                $statusLabel = $salaryConfig->status === 'active' ? 'đã tính lương' : 'đã đóng bảng lương';
                
                return back()->withErrors([
                    'semester_id' => "Không thể tạo lớp học cho học kỳ \"{$semester->name}\" vì {$statusLabel}. Việc thay đổi lớp học sẽ ảnh hưởng đến kết quả tính lương đã có."
                ]);
            }

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
            $semester = Semester::find($validated['semester_id']);
            $course = Course::find($validated['course_id']);
            
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

            $salaryConfig = SalaryConfig::where('semester_id', $validated['semester_id'])
                ->whereIn('status', ['active', 'closed'])
                ->first();
            if ($salaryConfig) {
                $semester = \App\Models\Semester::find($validated['semester_id']);
                $statusLabel = $salaryConfig->status === 'active' ? 'đã tính lương' : 'đã đóng bảng lương';
                
                return back()->withErrors([
                    'semester_id' => "Không thể tạo lớp học cho học kỳ \"{$semester->name}\" vì {$statusLabel}. Việc thay đổi lớp học sẽ ảnh hưởng đến kết quả tính lương đã có."
                ]);
            }

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
            $salaryConfig = SalaryConfig::where('semester_id', $classroom->semester_id)
                ->whereIn('status', ['active', 'closed'])
                ->first();
                
            if ($salaryConfig) {
                $statusLabel = $salaryConfig->status === 'active' ? 'đã tính lương' : 'đã đóng bảng lương';
                
                return back()->withErrors([
                    'permission' => "Không thể sửa lớp học vì học kỳ \"{$classroom->semester->name}\" {$statusLabel}. Việc thay đổi thông tin lớp học sẽ ảnh hưởng đến kết quả tính lương đã có."
                ]);
            }
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
            $salaryConfig = SalaryConfig::where('semester_id', $classroom->semester_id)
                ->whereIn('status', ['active', 'closed'])
                ->first();
                
            if ($salaryConfig) {
                $statusLabel = $salaryConfig->status === 'active' ? 'đã tính lương' : 'đã đóng bảng lương';
                
                return back()->withErrors([
                    'permission' => "Không thể xóa lớp học vì học kỳ \"{$classroom->semester->name}\" {$statusLabel}. Việc xóa lớp học sẽ ảnh hưởng đến kết quả tính lương đã có."
                ]);
            }
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

    // FIX: Add new method to get semesters by academic year
    public function getSemestersByAcademicYear(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');
        
        if (!$academicYearId) {
            return response()->json(['semesters' => []]);
        }
        
        $semesters = Semester::where('academicYear_id', $academicYearId)
            ->with('academicYear')
            ->orderBy('name')
            ->get();
        
        return response()->json(['semesters' => $semesters]);
    }

    /**
     * Hiển thị lớp học của giáo viên đang đăng nhập
     */
public function teacherClassrooms(Request $request)
{
    $user = auth()->user();
    
    // Chỉ cho phép giáo viên truy cập - ĐÚNG CÁCH
    if (!$user || !$user->isTeacher()) {
        abort(403, 'Bạn không có quyền truy cập trang này.');
    }
    
    // FIX: Kiểm tra teacher qua email - ĐÚNG CÁCH
    $teacher = Teacher::where('email', $user->email)->first();
    
    if (!$teacher) {
        abort(404, 'Không tìm thấy thông tin giảng viên');
    }
    
    // FIX: Base query - Chỉ lấy lớp của giáo viên đang đăng nhập
    $query = Classroom::with([
        'course.department',
        'semester.academicYear',
        'teacher.department',
        'teacher.degree'
    ])->where('teacher_id', $teacher->id);
    
    // Apply filters
    $academicYearId = $request->input('academic_year_id');
    $semesterId = $request->input('semester_id');
    $courseId = $request->input('course_id');
    
    if ($academicYearId) {
        $query->whereHas('semester', function ($q) use ($academicYearId) {
            $q->where('academicYear_id', $academicYearId);
        });
    }
    
    if ($semesterId) {
        $query->where('semester_id', $semesterId);
    }
    
    if ($courseId) {
        $query->where('course_id', $courseId);
    }
    
    $classrooms = $query->orderBy('created_at', 'desc')->paginate(10);
    
    // Get filter data - chỉ những khóa học mà giáo viên đang dạy
    $teacherCourses = Course::whereIn('id', 
        Classroom::where('teacher_id', $teacher->id)
            ->pluck('course_id')
            ->unique()
    )->with('department')->get();
    
    $academicYears = AcademicYear::with('semesters')->get();
    $semesters = Semester::with('academicYear')->get();
    
    return Inertia::render('Teachers/Classrooms', [
        'classrooms' => $classrooms,
        'courses' => $teacherCourses,
        'academicYears' => $academicYears,
        'semesters' => $semesters,
        'filters' => [
            'academic_year_id' => $academicYearId,
            'semester_id' => $semesterId,
            'course_id' => $courseId,
        ],
        'teacher' => $teacher->load(['department', 'degree'])
    ]);
}

}