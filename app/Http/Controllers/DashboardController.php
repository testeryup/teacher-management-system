<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Degree;
use App\Models\Teacher;
use App\Models\Department;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\Course;
use App\Models\Classroom;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request){
        // Lấy dữ liệu bằng cấp với số lượng giáo viên
        $degrees = Degree::withCount('teachers')->get();

        // Lấy dữ liệu khoa với số lượng giáo viên
        $departments = Department::withCount('teachers')->get();

        // Lấy tất cả giáo viên với thông tin khoa và bằng cấp
        $teachers = Teacher::with(['department', 'degree'])
            ->select('id', 'fullName', 'DOB', 'department_id', 'degree_id')
            ->get();

        // Lấy tất cả năm học
        $academicYears = AcademicYear::orderBy('startDate', 'desc')->get();
        
        // Lấy tất cả học kỳ
        $semesters = Semester::with('academicYear')->orderBy('startDate', 'desc')->get();

        // Lấy tham số lọc từ request
        $selectedAcademicYear = $request->input('academic_year');
        $selectedSemester = $request->input('semester');

        // Thống kê lớp học theo học phần
        $classroomStats = $this->getClassroomStats($selectedAcademicYear, $selectedSemester);

        // Tính tuổi trung bình theo khoa
        $teacherAgeByDepartment = Department::with('teachers')->get()->map(function ($dept) {
            $ages = $dept->teachers->map(function ($teacher) {
                return Carbon::parse($teacher->DOB)->age;
            });

            return [
                'department' => $dept->name,
                'average_age' => round($ages->avg(), 1),
            ];
        });

        return response()->json([
            'degrees' => $degrees,
            'departments' => $departments, 
            'teachers' => $teachers,
            'academic_years' => $academicYears,
            'semesters' => $semesters,
            'classroom_stats' => $classroomStats,
            'teachers_age_by_department' => $teacherAgeByDepartment,
            'total_teachers' => $teachers->count()
        ], 200);
    }

    private function getClassroomStats($academicYearId = null, $semesterId = null)
    {
        $query = Classroom::with(['course', 'semester.academicYear'])
            ->select('course_id', 'semester_id', DB::raw('COUNT(*) as class_count'), DB::raw('SUM(students) as total_students'))
            ->groupBy('course_id', 'semester_id');

        if ($academicYearId) {
            $query->whereHas('semester.academicYear', function ($q) use ($academicYearId) {
                $q->where('id', $academicYearId);
            });
        }

        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }

        return $query->get()->map(function ($stat) {
            return [
                'course_name' => $stat->course->name ?? 'Không xác định',
                'semester_name' => $stat->semester->name ?? 'Không xác định',
                'academic_year' => $stat->semester->academicYear->name ?? 'Không xác định',
                'class_count' => $stat->class_count,
                'total_students' => $stat->total_students ?? 0,
            ];
        });
    }
}
