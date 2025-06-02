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
use Illuminate\Support\Facades\Auth;

class ClassroomController extends Controller
{
    /**
     * Display a listing of the classrooms.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get all academic data
        $courses = Course::all();
        $academicYears = AcademicYear::all();
        $semesters = Semester::with('academicYear')->get();
        
        // Filter teachers and classrooms based on user role
        if ($user->isAdmin()) {
            // Admins see all teachers and classrooms
            $teachers = Teacher::with(['department', 'degree'])->get();
            $classrooms = Classroom::with(['course', 'semester.academicYear', 'teacher'])->get();
        } elseif ($user->isDepartmentHead() && $user->department_id) {
            // Department heads only see teachers from their department
            $teachers = Teacher::with(['department', 'degree'])
                ->where('department_id', $user->department_id)
                ->get();
                
            // Only show classrooms where the teacher is from their department
            $classrooms = Classroom::with(['course', 'semester.academicYear', 'teacher'])
                ->whereHas('teacher', function($q) use ($user) {
                    $q->where('department_id', $user->department_id);
                })
                ->orWhere('teacher_id', null) // Also include unassigned classrooms
                ->get();
        } else {
            // Other users (teachers) can't access this page
            // This should be handled by middleware, but just in case
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }
        return Inertia::render('Classrooms', [
            'classrooms' => $classrooms,
            'courses' => $courses,
            'academicYears' => $academicYears,
            'semesters' => $semesters,
            'teachers' => $teachers,
            'filters' => [] // Empty filters for initial load
        ]);
    }

    /**
     * Filter classrooms by academic year, semester, and course.
     */
    public function filter(Request $request)
    {
        $user = Auth::user();
        $query = Classroom::with(['course', 'semester.academicYear', 'teacher']);

        // Department head can only see classrooms with teachers from their department
        if ($user->isDepartmentHead() && $user->department_id) {
            $query->whereHas('teacher', function($q) use ($user) {
                $q->where('department_id', $user->department_id);
            })->orWhere('teacher_id', null); // Also include unassigned classrooms
        }

        // Filter by academic year if provided
        if ($request->filled('academicYear_id')) {
            $query->whereHas('semester', function($q) use ($request) {
                $q->where('academicYear_id', $request->academicYear_id);
            });
        }

        // Filter by semester if provided
        if ($request->filled('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        // Filter by course if provided
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        
        // Filter by teacher if provided
        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        $classrooms = $query->paginate(10)->withQueryString();
        
        $courses = Course::all();
        $academicYears = AcademicYear::all();
        $semesters = Semester::with('academicYear')->get();
        
        // Filter teachers based on user role
        if ($user->isAdmin()) {
            $teachers = Teacher::with(['department', 'degree'])->get();
        } elseif ($user->isDepartmentHead() && $user->department_id) {
            $teachers = Teacher::with(['department', 'degree'])
                ->where('department_id', $user->department_id)
                ->get();
        } else {
            $teachers = collect(); // Empty collection
        }

        return Inertia::render('Classrooms', [
            'classrooms' => $classrooms,
            'courses' => $courses,
            'academicYears' => $academicYears,
            'semesters' => $semesters,
            'teachers' => $teachers,
            'filters' => $request->only(['academicYear_id', 'semester_id', 'course_id', 'teacher_id'])
        ]);
    }

    /**
     * Store a newly created classroom in storage.
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'semester_id' => 'required|integer|exists:semesters,id',
                'course_id' => 'required|integer|exists:courses,id',
                'teacher_id' => 'nullable|integer|exists:teachers,id',
                'students' => 'required|integer|min:0|max:200',
                'class_count' => 'nullable|integer|min:1|max:50',
            ]);
            
            // For department heads, validate that the selected teacher is from their department
            if ($user->isDepartmentHead() && $user->department_id && !empty($validated['teacher_id'])) {
                $teacher = Teacher::find($validated['teacher_id']);
                
                if (!$teacher || $teacher->department_id != $user->department_id) {
                    return redirect()->back()
                        ->with('error', 'You can only assign teachers from your department')
                        ->withInput();
                }
            }
            
            $classCount = $validated['class_count'] ?? 1;
            $baseName = $validated['name'];
            
            // Remove class_count from validated data as it's not a database field
            unset($validated['class_count']);
            
            $createdClassrooms = [];
            
            // Create multiple classrooms if class_count > 1
            for ($i = 1; $i <= $classCount; $i++) {
                $classroomData = $validated;
                
                if ($classCount > 1) {
                    // Format: "Course Name (N01)", "Course Name (N02)", etc.
                    $suffix = ' (N' . str_pad($i, 2, '0', STR_PAD_LEFT) . ')';
                    $classroomData['name'] = $baseName . $suffix;
                } else {
                    $classroomData['name'] = $baseName;
                }
                
                $classroom = Classroom::create($classroomData);
                $createdClassrooms[] = $classroom;
            }
            
            $successMessage = $classCount > 1 
                ? "Đã tạo thành công {$classCount} lớp học"
                : 'Lớp học đã được tạo thành công';
            
            return redirect()->route('classrooms.index')
                ->with('message', $successMessage);
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
            $user = Auth::user();
            
            // Chỉ cho phép sửa name, teacher_id và students theo yêu cầu
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'teacher_id' => 'required|exists:teachers,id',
                'students' => 'required|integer|min:0',
            ]);
            
            // For department heads, validate that the selected teacher is from their department
            if ($user->isDepartmentHead() && $user->department_id) {
                $teacher = Teacher::find($validated['teacher_id']);
                
                if (!$teacher || $teacher->department_id != $user->department_id) {
                    return redirect()->back()
                        ->with('error', 'You can only assign teachers from your department')
                        ->withInput();
                }
                
                // Also check that the classroom is one they're allowed to modify
                // (either has no teacher or has a teacher from their department)
                if ($classroom->teacher && $classroom->teacher->department_id != $user->department_id) {
                    return redirect()->route('classrooms.index')
                        ->with('error', 'You can only modify classrooms assigned to teachers in your department');
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
            $user = Auth::user();
            
            // For department heads, check that they can delete this classroom
            if ($user->isDepartmentHead() && $user->department_id) {
                if ($classroom->teacher && $classroom->teacher->department_id != $user->department_id) {
                    return redirect()->route('classrooms.index')
                        ->with('error', 'You can only delete classrooms assigned to teachers in your department');
                }
            }
            
            // Check for any dependent relationships
            // if ($classroom->students()->count() > 0) {
            //     throw new Exception('Không thể xóa lớp học này vì đã có sinh viên đăng ký');
            // }
            
            $classroom->delete();
            return redirect()->route('classrooms.index')
                ->with('message', 'Lớp học đã được xóa thành công');
        } catch (\Exception $e) {
            return redirect()->route('classrooms.index')
                ->with('error', 'Không thể xóa lớp học: ' . $e->getMessage());
        }
    }
}