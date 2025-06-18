<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Classroom;
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\SalaryConfig;
use App\Models\TeacherSalary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get dashboard data based on user role
        if ($user->isAdmin()) {
            $dashboardData = $this->getAdminDashboardData();
        } elseif ($user->isDepartmentHead()) {
            $dashboardData = $this->getDepartmentHeadDashboardData($user);
        } else {
            $dashboardData = $this->getTeacherDashboardData($user);
        }

        return Inertia::render('dashboard', $dashboardData);
    }

    private function getAdminDashboardData()
    {
        // Basic statistics
        $totalTeachers = Teacher::count();
        $totalDepartments = Department::count();
        $totalCourses = Course::count();
        $totalClassrooms = Classroom::count();
        $activeSemesters = Semester::whereHas('academicYear', function($q) {
            $q->where('startDate', '<=', now())
              ->where('endDate', '>=', now());
        })->count();

        // Teachers by department (for chart)
        $teachersByDepartment = Department::withCount('teachers')
            ->orderBy('teachers_count', 'desc')
            ->get()
            ->map(function ($dept) {
                return [
                    'name' => $dept->name,
                    'abbrName' => $dept->abbrName,
                    'teachers_count' => $dept->teachers_count,
                    'color' => $this->getDepartmentColor($dept->id)
                ];
            });

        // Teachers by degree
        $teachersByDegree = Degree::withCount('teachers')
            ->orderBy('teachers_count', 'desc')
            ->get()
            ->map(function ($degree) {
                return [
                    'id' => $degree->id,
                    'name' => $degree->name,
                    'teachers_count' => $degree->teachers_count,
                    'baseSalaryFactor' => $degree->baseSalaryFactor,
                    'percentage' => 0 // Will calculate in frontend
                ];
            });

        // Salary statistics
        $salaryStats = $this->getSalaryStatistics();

        // Recent activities
        $recentActivities = $this->getRecentActivities();

        // Monthly trends
        $monthlyTrends = $this->getMonthlyTrends();

        // Classroom statistics
        $classroomStats = $this->getClassroomStatistics();

        // Performance metrics
        $performanceMetrics = $this->getPerformanceMetrics();

        return [
            'userRole' => 'admin',
            'stats' => [
                'totalTeachers' => $totalTeachers,
                'totalDepartments' => $totalDepartments,
                'totalCourses' => $totalCourses,
                'totalClassrooms' => $totalClassrooms,
                'activeSemesters' => $activeSemesters,
                'avgTeachersPerDept' => $totalDepartments > 0 ? round($totalTeachers / $totalDepartments, 1) : 0,
            ],
            'teachersByDepartment' => $teachersByDepartment,
            'teachersByDegree' => $teachersByDegree,
            'salaryStats' => $salaryStats,
            'recentActivities' => $recentActivities,
            'monthlyTrends' => $monthlyTrends,
            'classroomStats' => $classroomStats,
            'performanceMetrics' => $performanceMetrics,
        ];
    }

    private function getDepartmentHeadDashboardData($user)
    {
        $departmentId = $user->department_id;

        // Department-specific statistics
        $departmentTeachers = Teacher::where('department_id', $departmentId)->count();
        $departmentCourses = Course::where('department_id', $departmentId)->count();
        $departmentClassrooms = Classroom::whereHas('course', function($q) use ($departmentId) {
            $q->where('department_id', $departmentId);
        })->count();

        // Teachers by degree in department
        $teachersByDegree = Degree::withCount(['teachers' => function($q) use ($departmentId) {
            $q->where('department_id', $departmentId);
        }])
        ->having('teachers_count', '>', 0)
        ->orderBy('teachers_count', 'desc')
        ->get();

        // Department salary stats
        $departmentSalaryStats = $this->getDepartmentSalaryStats($departmentId);

        // Department activities
        $departmentActivities = $this->getDepartmentActivities($departmentId);

        return [
            'userRole' => 'department_head',
            'departmentInfo' => Department::find($departmentId),
            'stats' => [
                'departmentTeachers' => $departmentTeachers,
                'departmentCourses' => $departmentCourses,
                'departmentClassrooms' => $departmentClassrooms,
            ],
            'teachersByDegree' => $teachersByDegree,
            'salaryStats' => $departmentSalaryStats,
            'recentActivities' => $departmentActivities,
        ];
    }

    private function getSalaryStatistics()
    {
        $currentYear = now()->year;
        
        return [
            'totalPaidSalary' => TeacherSalary::sum('total_salary'),
            'averageSalaryPerTeacher' => TeacherSalary::avg('total_salary'),
            'highestSalary' => TeacherSalary::max('total_salary'),
            'totalSalaryConfigs' => SalaryConfig::count(),
            'activeSalaryConfigs' => SalaryConfig::where('status', 'active')->count(),
            'closedSalaryConfigs' => SalaryConfig::where('status', 'closed')->count(),
            'currentYearSalary' => TeacherSalary::whereHas('salaryConfig.semester.academicYear', function($q) use ($currentYear) {
                $q->where('name', 'like', $currentYear . '%');
            })->sum('total_salary'),
        ];
    }

    private function getRecentActivities()
    {
        $activities = [];

        // Recent teachers
        $recentTeachers = Teacher::with('department')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentTeachers as $teacher) {
            $activities[] = [
                'type' => 'teacher_added',
                'title' => "Thêm giáo viên mới: {$teacher->fullName}",
                'subtitle' => "Khoa {$teacher->department->name}",
                'time' => $teacher->created_at->diffForHumans(),
                'icon' => 'user-plus',
                'color' => 'green'
            ];
        }

        // Recent classrooms
        $recentClassrooms = Classroom::with(['course', 'teacher'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentClassrooms as $classroom) {
            $activities[] = [
                'type' => 'classroom_added',
                'title' => "Tạo lớp học: {$classroom->name}",
                'subtitle' => "Môn {$classroom->course->name} - GV {$classroom->teacher->fullName}",
                'time' => $classroom->created_at->diffForHumans(),
                'icon' => 'book-open',
                'color' => 'blue'
            ];
        }

        // Recent salary calculations
        $recentSalaryConfigs = SalaryConfig::with('semester')
            ->orderBy('updated_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentSalaryConfigs as $config) {
            $activities[] = [
                'type' => 'salary_calculated',
                'title' => "Tính lương học kỳ: {$config->semester->name}",
                'subtitle' => "Trạng thái: " . $this->getSalaryStatusLabel($config->status),
                'time' => $config->updated_at->diffForHumans(),
                'icon' => 'dollar-sign',
                'color' => 'orange'
            ];
        }

        // Sort by time and return top 8
        return collect($activities)
            ->sortByDesc(function($activity) {
                return Carbon::parse($activity['time']);
            })
            ->take(8)
            ->values()
            ->toArray();
    }

    private function getMonthlyTrends()
    {
        $months = collect(range(1, 12))->map(function($month) {
            $monthName = Carbon::create(null, $month)->format('M');
            return [
                'month' => $monthName,
                'teachers' => Teacher::whereMonth('created_at', $month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'classrooms' => Classroom::whereMonth('created_at', $month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'salary' => TeacherSalary::whereHas('salaryConfig', function($q) use ($month) {
                    $q->whereMonth('created_at', $month)
                      ->whereYear('created_at', now()->year);
                })->sum('total_salary'),
            ];
        });

        return $months;
    }

    private function getClassroomStatistics()
    {
        return [
            'totalClassrooms' => Classroom::count(),
            'classroomsWithTeacher' => Classroom::whereNotNull('teacher_id')->count(),
            'classroomsWithoutTeacher' => Classroom::whereNull('teacher_id')->count(),
            'averageStudentsPerClass' => Classroom::avg('students'),
            'totalStudents' => Classroom::sum('students'),
            'largestClass' => Classroom::max('students'),
            'smallestClass' => Classroom::min('students'),
            'classesBySize' => [
                'small' => Classroom::where('students', '<', 30)->count(),
                'medium' => Classroom::whereBetween('students', [30, 50])->count(),
                'large' => Classroom::where('students', '>', 50)->count(),
            ]
        ];
    }

    private function getPerformanceMetrics()
    {
        $thisMonth = now();
        $lastMonth = now()->subMonth();

        return [
            'teachersGrowth' => $this->calculateGrowthRate(
                Teacher::whereMonth('created_at', $thisMonth->month)->count(),
                Teacher::whereMonth('created_at', $lastMonth->month)->count()
            ),
            'classroomsGrowth' => $this->calculateGrowthRate(
                Classroom::whereMonth('created_at', $thisMonth->month)->count(),
                Classroom::whereMonth('created_at', $lastMonth->month)->count()
            ),
            'salaryGrowth' => $this->calculateGrowthRate(
                TeacherSalary::whereHas('salaryConfig', function($q) use ($thisMonth) {
                    $q->whereMonth('created_at', $thisMonth->month);
                })->sum('total_salary'),
                TeacherSalary::whereHas('salaryConfig', function($q) use ($lastMonth) {
                    $q->whereMonth('created_at', $lastMonth->month);
                })->sum('total_salary')
            ),
        ];
    }

    private function calculateGrowthRate($current, $previous)
    {
        if ($previous == 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function getDepartmentColor($departmentId)
    {
        $colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        return $colors[$departmentId % count($colors)];
    }

    private function getSalaryStatusLabel($status)
    {
        return match($status) {
            'draft' => 'Bản nháp',
            'active' => 'Đã tính',
            'closed' => 'Đã đóng',
            default => 'Không xác định'
        };
    }
}
