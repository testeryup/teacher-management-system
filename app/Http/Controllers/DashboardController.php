<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
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
use Illuminate\Support\Facades\Cache;


class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get dashboard data based on user role
        if ($user->isAdmin()) {
            $dashboardData = $this->getAdminDashboardDataOptimized();
        } elseif ($user->isDepartmentHead()) {
            $dashboardData = $this->getAdminDashboardDataOptimized();
        } elseif ($user->isTeacher()) {
            return $this->teacherDashboard($user);
        } else {
            abort(403, 'Unauthorized access');
        }

        return Inertia::render('dashboard', $dashboardData);
    }

    private function getAdminDashboardDataOptimized()
    {
        // FIX: Cache dashboard data để tránh timeout
        return Cache::remember('admin_dashboard_data', 300, function () { // Cache 5 phút
            try {
                // Single optimized query for basic stats
                $basicStats = $this->getOptimizedBasicStats();
                
                // Parallel data fetching using optimized queries
                $promises = [
                    'teachersByDepartment' => function() { return $this->getTeachersByDepartmentOptimized(); },
                    'teachersByDegree' => function() { return $this->getTeachersByDegreeOptimized(); },
                    'salaryStats' => function() { return $this->getSalaryStatisticsOptimized(); },
                    'recentActivities' => function() { return $this->getRecentActivitiesOptimized(); },
                    'monthlyTrends' => function() { return $this->getMonthlyTrendsOptimized(); },
                    'classroomStats' => function() { return $this->getClassroomStatisticsOptimized(); },
                    'performanceMetrics' => function() { return $this->getPerformanceMetricsOptimized(); },
                ];
                
                // Execute all queries
                $results = [];
                foreach ($promises as $key => $callable) {
                    $results[$key] = $callable();
                }
                // dd($basicStats);
                return array_merge($basicStats, $results);
                
            } catch (\Exception $e) {
                Log::error('Dashboard data error: ' . $e->getMessage());
                
                // FIX: Return safe fallback data
                return $this->getFallbackDashboardData();
            }
        });
    }

    private function getOptimizedBasicStats()
    {
        // Single optimized query cho basic stats
        $stats = DB::select("
            SELECT
                (SELECT COUNT(*) FROM teachers) as total_teachers,
                (SELECT COUNT(*) FROM departments) as total_departments,
                (SELECT COUNT(*) FROM courses) as total_courses,
                (SELECT COUNT(*) FROM classrooms) as total_classrooms,
                (SELECT COUNT(*) FROM semesters s
                 JOIN academic_years ay ON s.academicYear_id = ay.id
                 WHERE ay.startDate <= NOW() AND ay.endDate >= NOW()) as active_semesters
        ")[0];

        return [
            'userRole' => 'admin',
            'stats' => [
                'totalTeachers' => (int)$stats->total_teachers,
                'totalDepartments' => (int)$stats->total_departments,
                'totalCourses' => (int)$stats->total_courses,
                'totalClassrooms' => (int)$stats->total_classrooms,
                'activeSemesters' => (int)$stats->active_semesters,
                'avgTeachersPerDept' => $stats->total_departments > 0 
                    ? round($stats->total_teachers / $stats->total_departments, 1) : 0,
            ]
        ];
    }

    private function getTeachersByDepartmentOptimized()
    {
        try {
            return DB::table('teachers')
                ->join('departments', 'teachers.department_id', '=', 'departments.id')
                ->select(
                    'departments.name', 
                    'departments.abbrName',
                    DB::raw('COUNT(*) as teachers_count'),
                    DB::raw('departments.id as dept_id')
                )
                ->groupBy('departments.id', 'departments.name', 'departments.abbrName')
                ->orderBy('teachers_count', 'desc')
                ->limit(10) // Limit results
                ->get()
                ->map(function($dept) {
                    return [
                        'name' => $dept->name,
                        'abbrName' => $dept->abbrName,
                        'teachers_count' => (int)$dept->teachers_count,
                        'color' => $this->getDepartmentColor($dept->dept_id)
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Teachers by department error: ' . $e->getMessage());
            return [];
        }
    }

    private function getTeachersByDegreeOptimized()
    {
        try {
            return DB::table('teachers')
                ->join('degrees', 'teachers.degree_id', '=', 'degrees.id')
                ->select(
                    'degrees.id',
                    'degrees.name', 
                    'degrees.baseSalaryFactor',
                    DB::raw('COUNT(*) as teachers_count')
                )
                ->groupBy('degrees.id', 'degrees.name', 'degrees.baseSalaryFactor')
                ->orderBy('teachers_count', 'desc')
                ->limit(10)
                ->get()
                ->map(function($degree) {
                    return [
                        'id' => $degree->id,
                        'name' => $degree->name,
                        'teachers_count' => (int)$degree->teachers_count,
                        'baseSalaryFactor' => (float)$degree->baseSalaryFactor,
                        'percentage' => 0 // Will calculate in frontend
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Teachers by degree error: ' . $e->getMessage());
            return [];
        }
    }

    private function getSalaryStatisticsOptimized()
    {
        $currentYear = now()->year;
        
        try {
            // Single optimized query for salary stats
            $salaryStats = DB::select("
                SELECT 
                    COALESCE(SUM(ts.total_salary), 0) as total_paid_salary,
                    COALESCE(AVG(ts.total_salary), 0) as average_salary_per_teacher,
                    COALESCE(MAX(ts.total_salary), 0) as highest_salary,
                    (SELECT COUNT(*) FROM salary_configs) as total_salary_configs,
                    (SELECT COUNT(*) FROM salary_configs WHERE status = 'active') as active_salary_configs,
                    (SELECT COUNT(*) FROM salary_configs WHERE status = 'closed') as closed_salary_configs,
                    COALESCE((
                        SELECT SUM(ts2.total_salary) 
                        FROM teacher_salaries ts2
                        JOIN salary_configs sc2 ON ts2.salary_config_id = sc2.id
                        JOIN semesters s2 ON sc2.semester_id = s2.id
                        JOIN academic_years ay2 ON s2.academicYear_id = ay2.id
                        WHERE ay2.name LIKE '{$currentYear}%'
                    ), 0) as current_year_salary
                FROM teacher_salaries ts
            ")[0];

            return [
                'totalPaidSalary' => (float)$salaryStats->total_paid_salary,
                'averageSalaryPerTeacher' => (float)$salaryStats->average_salary_per_teacher,
                'highestSalary' => (float)$salaryStats->highest_salary,
                'totalSalaryConfigs' => (int)$salaryStats->total_salary_configs,
                'activeSalaryConfigs' => (int)$salaryStats->active_salary_configs,
                'closedSalaryConfigs' => (int)$salaryStats->closed_salary_configs,
                'currentYearSalary' => (float)$salaryStats->current_year_salary,
            ];
        } catch (\Exception $e) {
            Log::error('Salary stats error: ' . $e->getMessage());
            return [
                'totalPaidSalary' => 0,
                'averageSalaryPerTeacher' => 0,
                'highestSalary' => 0,
                'totalSalaryConfigs' => 0,
                'activeSalaryConfigs' => 0,
                'closedSalaryConfigs' => 0,
                'currentYearSalary' => 0,
            ];
        }
    }

    private function getRecentActivitiesOptimized()
    {
        try {
            // Optimized query với UNION
            $activities = DB::select("
                (SELECT 
                    'teacher_added' as type,
                    CONCAT('Thêm giáo viên mới: ', t.fullName) as title,
                    CONCAT('Khoa ', d.name) as subtitle,
                    t.created_at,
                    'user-plus' as icon,
                    'green' as color
                 FROM teachers t 
                 JOIN departments d ON t.department_id = d.id
                 ORDER BY t.created_at DESC 
                 LIMIT 3)
                UNION ALL
                (SELECT 
                    'classroom_added' as type,
                    CONCAT('Tạo lớp học: ', c.name) as title,
                    CONCAT('Môn ', co.name) as subtitle,
                    c.created_at,
                    'book-open' as icon,
                    'blue' as color
                 FROM classrooms c 
                 JOIN courses co ON c.course_id = co.id
                 ORDER BY c.created_at DESC 
                 LIMIT 3)
                UNION ALL
                (SELECT 
                    'salary_calculated' as type,
                    CONCAT('Tính lương học kỳ: ', s.name) as title,
                    CONCAT('Trạng thái: ', sc.status) as subtitle,
                    sc.updated_at as created_at,
                    'dollar-sign' as icon,
                    'orange' as color
                 FROM salary_configs sc
                 JOIN semesters s ON sc.semester_id = s.id
                 ORDER BY sc.updated_at DESC 
                 LIMIT 2)
                ORDER BY created_at DESC
                LIMIT 8
            ");

            return collect($activities)->map(function($activity) {
                return [
                    'type' => $activity->type,
                    'title' => $activity->title,
                    'subtitle' => $activity->subtitle,
                    'time' => Carbon::parse($activity->created_at)->diffForHumans(),
                    'icon' => $activity->icon,
                    'color' => $activity->color
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Recent activities error: ' . $e->getMessage());
            return [];
        }
    }

    private function getMonthlyTrendsOptimized()
    {
        $currentYear = now()->year;
        
        try {
            // Single query with aggregations
            $trends = DB::select("
                SELECT 
                    MONTH(created_at) as month,
                    COUNT(CASE WHEN table_name = 'teachers' THEN 1 END) as teachers,
                    COUNT(CASE WHEN table_name = 'classrooms' THEN 1 END) as classrooms,
                    COALESCE(SUM(CASE WHEN table_name = 'teacher_salaries' THEN total_salary END), 0) as salary
                FROM (
                    SELECT created_at, 'teachers' as table_name, 0 as total_salary 
                    FROM teachers WHERE YEAR(created_at) = {$currentYear}
                    UNION ALL
                    SELECT created_at, 'classrooms' as table_name, 0 as total_salary 
                    FROM classrooms WHERE YEAR(created_at) = {$currentYear}
                    UNION ALL
                    SELECT ts.created_at, 'teacher_salaries' as table_name, ts.total_salary 
                    FROM teacher_salaries ts 
                    JOIN salary_configs sc ON ts.salary_config_id = sc.id
                    WHERE YEAR(sc.created_at) = {$currentYear}
                ) combined
                GROUP BY MONTH(created_at)
                ORDER BY MONTH(created_at)
            ");

            $monthsData = collect(range(1, 12))->map(function($month) use ($trends) {
                $monthData = collect($trends)->firstWhere('month', $month);
                return [
                    'month' => Carbon::create(null, $month)->format('M'),
                    'teachers' => $monthData ? (int)$monthData->teachers : 0,
                    'classrooms' => $monthData ? (int)$monthData->classrooms : 0,
                    'salary' => $monthData ? (float)$monthData->salary : 0,
                ];
            });

            return $monthsData->toArray();
        } catch (\Exception $e) {
            Log::error('Monthly trends error: ' . $e->getMessage());
            return collect(range(1, 12))->map(function($month) {
                return [
                    'month' => Carbon::create(null, $month)->format('M'),
                    'teachers' => 0,
                    'classrooms' => 0,
                    'salary' => 0,
                ];
            })->toArray();
        }
    }

    private function getClassroomStatisticsOptimized()
    {
        try {
            $stats = DB::select("
                SELECT 
                    COUNT(*) as total_classrooms,
                    COUNT(teacher_id) as classrooms_with_teacher,
                    COUNT(*) - COUNT(teacher_id) as classrooms_without_teacher,
                    COALESCE(AVG(students), 0) as average_students_per_class,
                    COALESCE(SUM(students), 0) as total_students,
                    COALESCE(MAX(students), 0) as largest_class,
                    COALESCE(MIN(students), 0) as smallest_class,
                    COUNT(CASE WHEN students < 30 THEN 1 END) as small_classes,
                    COUNT(CASE WHEN students BETWEEN 30 AND 50 THEN 1 END) as medium_classes,
                    COUNT(CASE WHEN students > 50 THEN 1 END) as large_classes
                FROM classrooms
            ")[0];

            return [
                'totalClassrooms' => (int)$stats->total_classrooms,
                'classroomsWithTeacher' => (int)$stats->classrooms_with_teacher,
                'classroomsWithoutTeacher' => (int)$stats->classrooms_without_teacher,
                'averageStudentsPerClass' => round((float)$stats->average_students_per_class, 1),
                'totalStudents' => (int)$stats->total_students,
                'largestClass' => (int)$stats->largest_class,
                'smallestClass' => (int)$stats->smallest_class,
                'classesBySize' => [
                    'small' => (int)$stats->small_classes,
                    'medium' => (int)$stats->medium_classes,
                    'large' => (int)$stats->large_classes,
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Classroom stats error: ' . $e->getMessage());
            return [
                'totalClassrooms' => 0,
                'classroomsWithTeacher' => 0,
                'classroomsWithoutTeacher' => 0,
                'averageStudentsPerClass' => 0,
                'totalStudents' => 0,
                'largestClass' => 0,
                'smallestClass' => 0,
                'classesBySize' => [
                    'small' => 0,
                    'medium' => 0,
                    'large' => 0,
                ]
            ];
        }
    }

    private function getPerformanceMetricsOptimized()
    {
        $thisMonth = now()->month;
        $lastMonth = now()->subMonth()->month;
        
        try {
            $metrics = DB::select("
                SELECT 
                    COUNT(CASE WHEN table_name = 'teachers' AND MONTH(created_at) = {$thisMonth} THEN 1 END) as teachers_this_month,
                    COUNT(CASE WHEN table_name = 'teachers' AND MONTH(created_at) = {$lastMonth} THEN 1 END) as teachers_last_month,
                    COUNT(CASE WHEN table_name = 'classrooms' AND MONTH(created_at) = {$thisMonth} THEN 1 END) as classrooms_this_month,
                    COUNT(CASE WHEN table_name = 'classrooms' AND MONTH(created_at) = {$lastMonth} THEN 1 END) as classrooms_last_month,
                    COALESCE(SUM(CASE WHEN table_name = 'teacher_salaries' AND MONTH(created_at) = {$thisMonth} THEN total_salary END), 0) as salary_this_month,
                    COALESCE(SUM(CASE WHEN table_name = 'teacher_salaries' AND MONTH(created_at) = {$lastMonth} THEN total_salary END), 0) as salary_last_month
                FROM (
                    SELECT created_at, 'teachers' as table_name, 0 as total_salary FROM teachers
                    UNION ALL
                    SELECT created_at, 'classrooms' as table_name, 0 as total_salary FROM classrooms
                    UNION ALL
                    SELECT ts.created_at, 'teacher_salaries' as table_name, ts.total_salary 
                    FROM teacher_salaries ts 
                    JOIN salary_configs sc ON ts.salary_config_id = sc.id
                ) combined
            ")[0];

            return [
                'teachersGrowth' => $this->calculateGrowthRate(
                    (int)$metrics->teachers_this_month,
                    (int)$metrics->teachers_last_month
                ),
                'classroomsGrowth' => $this->calculateGrowthRate(
                    (int)$metrics->classrooms_this_month,
                    (int)$metrics->classrooms_last_month
                ),
                'salaryGrowth' => $this->calculateGrowthRate(
                    (float)$metrics->salary_this_month,
                    (float)$metrics->salary_last_month
                ),
            ];
        } catch (\Exception $e) {
            Log::error('Performance metrics error: ' . $e->getMessage());
            return [
                'teachersGrowth' => 0,
                'classroomsGrowth' => 0,
                'salaryGrowth' => 0,
            ];
        }
    }

    // FIX: Fallback data nếu database timeout
    private function getFallbackDashboardData()
    {
        return [
            'userRole' => 'admin',
            'stats' => [
                'totalTeachers' => 0,
                'totalDepartments' => 0,
                'totalCourses' => 0,
                'totalClassrooms' => 0,
                'activeSemesters' => 0,
                'avgTeachersPerDept' => 0,
            ],
            'teachersByDepartment' => [],
            'teachersByDegree' => [],
            'salaryStats' => [
                'totalPaidSalary' => 0,
                'averageSalaryPerTeacher' => 0,
                'highestSalary' => 0,
                'totalSalaryConfigs' => 0,
                'activeSalaryConfigs' => 0,
                'closedSalaryConfigs' => 0,
                'currentYearSalary' => 0,
            ],
            'recentActivities' => [],
            'monthlyTrends' => collect(range(1, 12))->map(function($month) {
                return [
                    'month' => Carbon::create(null, $month)->format('M'),
                    'teachers' => 0,
                    'classrooms' => 0,
                    'salary' => 0,
                ];
            })->toArray(),
            'classroomStats' => [
                'totalClassrooms' => 0,
                'classroomsWithTeacher' => 0,
                'classroomsWithoutTeacher' => 0,
                'averageStudentsPerClass' => 0,
                'totalStudents' => 0,
                'largestClass' => 0,
                'smallestClass' => 0,
                'classesBySize' => [
                    'small' => 0,
                    'medium' => 0,
                    'large' => 0,
                ],
            ],
            'performanceMetrics' => [
                'teachersGrowth' => 0,
                'classroomsGrowth' => 0,
                'salaryGrowth' => 0,
            ],
            'error' => 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.'
        ];
    }

    // Keep existing helper methods
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

    private function teacherDashboard($user)
    {
        // FIX: Lấy teacher qua email thay vì relationship
        $teacher = Teacher::where('email', $user->email)->first();
        
        if (!$teacher) {
            abort(404, 'Thông tin giảng viên không tồn tại');
        }
        
        // Thống kê cơ bản
        $totalClasses = Classroom::where('teacher_id', $teacher->id)->count();
        
        // Lớp học hiện tại (học kỳ gần nhất)
        $currentSemester = Semester::with('academicYear')
            ->orderBy('created_at', 'desc')
            ->first();
        
        $currentClasses = 0;
        if ($currentSemester) {
            $currentClasses = Classroom::where('teacher_id', $teacher->id)
                ->where('semester_id', $currentSemester->id)
                ->count();
        }
        
        // Tổng lương đã nhận (từ các học kỳ đã tính)
        $totalEarnings = TeacherSalary::where('teacher_id', $teacher->id)->sum('total_salary');
        
        // Lớp học gần đây
        $recentClasses = Classroom::with(['course', 'semester.academicYear'])
            ->where('teacher_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Lương theo học kỳ gần đây
        $recentSalaries = TeacherSalary::with(['salaryConfig.semester', 'classroom.course'])
            ->where('teacher_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->groupBy(function($salary) {
                return $salary->salaryConfig->semester->name;
            });
        
        return Inertia::render('Teachers/Dashboard', [
            'teacher' => $teacher->load(['department', 'degree']),
            'stats' => [
                'totalClasses' => $totalClasses,
                'currentClasses' => $currentClasses,
                'totalEarnings' => $totalEarnings,
                'currentSemester' => $currentSemester
            ],
            'recentClasses' => $recentClasses,
            'recentSalaries' => $recentSalaries
        ]);
    }
}