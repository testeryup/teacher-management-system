<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Department;
use App\Models\AcademicYear;
use App\Models\TeacherSalary;
use App\Models\SalaryConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * UC4 - Main reports index page
     */
    public function index()
    {
        $user = auth()->user();
        
        if (!$user->isAdmin() && !$user->isDepartmentHead()) {
            abort(403, 'Bạn không có quyền truy cập báo cáo');
        }

        $academicYears = AcademicYear::with('semesters')->orderBy('name', 'desc')->get();
        $departments = $user->isAdmin() ? Department::all() : Department::where('id', $user->department_id)->get();
        $teachers = $user->isAdmin() ? 
            Teacher::with(['department', 'degree'])->get() : 
            Teacher::with(['department', 'degree'])->where('department_id', $user->department_id)->get();

        return Inertia::render('Reports/Index', [
            'academicYears' => $academicYears,
            'departments' => $departments,
            'teachers' => $teachers
        ]);
    }

    /**
     * FIX: Helper method để lấy data báo cáo teacher yearly
     */
private function getTeacherYearlyData($teacherId, $academicYearId)
{
    $user = auth()->user();

    // Check permission
    if ($user->isDepartmentHead()) {
        $teacher = Teacher::find($teacherId);
        if ($teacher->department_id !== $user->department_id) {
            abort(403, 'Bạn chỉ có thể xem báo cáo giáo viên trong khoa của mình');
        }
    }

    $teacher = Teacher::with(['department', 'degree'])->find($teacherId);
    $academicYear = AcademicYear::with('semesters')->find($academicYearId);

    // FIX: Query với relationship đúng tên cột
    $salaryData = TeacherSalary::with([
        'salaryConfig.semester',
        'classroom.course'
    ])
    ->where('teacher_id', $teacherId)
    ->whereHas('salaryConfig.semester', function($q) use ($academicYearId) {
        // FIX: Sử dụng tên cột đúng trong database
        $q->where('academicYear_id', $academicYearId); // Thay vì 'academicYear_id'
    })
    ->get()
    ->groupBy('salaryConfig.semester.name');

    // Calculate totals
    $totalSalary = 0;
    $totalClasses = 0;
    $totalLessons = 0;
    
    foreach ($salaryData as $semesterSalaries) {
        foreach ($semesterSalaries as $salary) {
            $totalSalary += (float) ($salary->total_salary ?? 0);
            $totalClasses += 1;
            $totalLessons += (float) ($salary->converted_lessons ?? 0);
        }
    }

    return [
        'teacher' => $teacher,
        'academicYear' => $academicYear,
        'salaryData' => $salaryData,
        'summary' => [
            'totalSalary' => $totalSalary,
            'totalClasses' => $totalClasses,
            'totalLessons' => $totalLessons,
            'averageSalaryPerClass' => $totalClasses > 0 ? $totalSalary / $totalClasses : 0
        ]
    ];
}

    /**
     * FIX: Helper method để lấy data báo cáo department
     */
    private function getDepartmentReportData($departmentId, $academicYearId)
    {
        $user = auth()->user();
        
        if ($user->isDepartmentHead() && $departmentId != $user->department_id) {
            abort(403, 'Bạn chỉ có thể xem báo cáo khoa của mình');
        }

        $department = Department::find($departmentId);
        $academicYear = AcademicYear::find($academicYearId);

        // Get all teachers in department with their salary data
        $teachersData = Teacher::with(['degree'])
            ->where('department_id', $departmentId)
            ->get()
            ->map(function ($teacher) use ($academicYearId) {
                $salaryData = TeacherSalary::with([
                    'salaryConfig.semester',
                    'classroom.course'
                ])
                ->where('teacher_id', $teacher->id)
                ->whereHas('salaryConfig.semester', function($q) use ($academicYearId) {
                    $q->where('academicYear_id', $academicYearId);
                })
                ->get();

                $totalSalary = $salaryData->sum('total_salary');
                $totalClasses = $salaryData->count();
                $totalLessons = $salaryData->sum('converted_lessons');

                return [
                    'teacher' => $teacher,
                    'totalSalary' => (float) $totalSalary,
                    'totalClasses' => $totalClasses,
                    'totalLessons' => (float) $totalLessons,
                    'salaryBySemester' => $salaryData->groupBy('salaryConfig.semester.name')
                        ->map(function ($semesterSalaries) {
                            return [
                                'totalSalary' => (float) $semesterSalaries->sum('total_salary'),
                                'totalClasses' => $semesterSalaries->count(),
                                'totalLessons' => (float) $semesterSalaries->sum('converted_lessons')
                            ];
                        })
                ];
            })
            ->filter(function ($teacherData) {
                return $teacherData['totalSalary'] > 0;
            })
            ->sortByDesc('totalSalary');

        // Calculate department totals
        $departmentTotals = [
            'totalTeachers' => $teachersData->count(),
            'totalSalary' => $teachersData->sum('totalSalary'),
            'totalClasses' => $teachersData->sum('totalClasses'),
            'totalLessons' => $teachersData->sum('totalLessons'),
            'averageSalaryPerTeacher' => $teachersData->count() > 0 ? 
                $teachersData->sum('totalSalary') / $teachersData->count() : 0
        ];

        return [
            'department' => $department,
            'academicYear' => $academicYear,
            'teachersData' => $teachersData->values(),
            'departmentTotals' => $departmentTotals
        ];
    }

    /**
     * FIX: Helper method để lấy data báo cáo school
     */
    private function getSchoolReportData($academicYearId)
    {
        $user = auth()->user();
        
        if (!$user->isAdmin()) {
            abort(403, 'Chỉ Admin mới có quyền xem báo cáo toàn trường');
        }

        $academicYear = AcademicYear::find($academicYearId);

        // Get data by departments
        $departmentsData = Department::get()
            ->map(function ($department) use ($academicYearId) {
                $teachersData = Teacher::where('department_id', $department->id)
                    ->get()
                    ->map(function ($teacher) use ($academicYearId) {
                        $salaryData = TeacherSalary::where('teacher_id', $teacher->id)
                            ->whereHas('salaryConfig.semester', function($q) use ($academicYearId) {
                                $q->where('academicYear_id', $academicYearId);
                            })
                            ->get();

                        return [
                            'teacher' => $teacher,
                            'totalSalary' => (float) $salaryData->sum('total_salary'),
                            'totalClasses' => $salaryData->count(),
                            'totalLessons' => (float) $salaryData->sum('converted_lessons')
                        ];
                    })
                    ->filter(function ($teacherData) {
                        return $teacherData['totalSalary'] > 0;
                    });

                return [
                    'department' => $department,
                    'teachersCount' => $teachersData->count(),
                    'totalSalary' => $teachersData->sum('totalSalary'),
                    'totalClasses' => $teachersData->sum('totalClasses'),
                    'totalLessons' => $teachersData->sum('totalLessons'),
                    'teachers' => $teachersData->sortByDesc('totalSalary')->take(5)->values()
                ];
            })
            ->filter(function ($departmentData) {
                return $departmentData['teachersCount'] > 0;
            })
            ->sortByDesc('totalSalary');

        // Calculate school totals
        $schoolTotals = [
            'totalDepartments' => $departmentsData->count(),
            'totalTeachers' => $departmentsData->sum('teachersCount'),
            'totalSalary' => $departmentsData->sum('totalSalary'),
            'totalClasses' => $departmentsData->sum('totalClasses'),
            'totalLessons' => $departmentsData->sum('totalLessons'),
            'averageSalaryPerTeacher' => $departmentsData->sum('teachersCount') > 0 ? 
                $departmentsData->sum('totalSalary') / $departmentsData->sum('teachersCount') : 0,
            'averageSalaryPerDepartment' => $departmentsData->count() > 0 ? 
                $departmentsData->sum('totalSalary') / $departmentsData->count() : 0
        ];

        return [
            'academicYear' => $academicYear,
            'departmentsData' => $departmentsData->values(),
            'schoolTotals' => $schoolTotals
        ];
    }

    /**
     * UC4.1 - Báo cáo tiền dạy của giáo viên trong một năm
     */
    public function teacherYearlyReport(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'academic_year_id' => 'required|exists:academic_years,id'
        ]);

        $reportData = $this->getTeacherYearlyData($validated['teacher_id'], $validated['academic_year_id']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($reportData);
        }

        return Inertia::render('Reports/TeacherYearly', $reportData);
    }

    /**
     * UC4.2 - Báo cáo tiền dạy của giáo viên một khoa
     */
    public function departmentReport(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'academic_year_id' => 'required|exists:academic_years,id'
        ]);

        $reportData = $this->getDepartmentReportData($validated['department_id'], $validated['academic_year_id']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($reportData);
        }

        return Inertia::render('Reports/Department', $reportData);
    }

    /**
     * UC4.3 - Báo cáo tiền dạy của giáo viên toàn trường
     */
    public function schoolReport(Request $request)
    {
        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id'
        ]);

        $reportData = $this->getSchoolReportData($validated['academic_year_id']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($reportData);
        }

        return Inertia::render('Reports/School', $reportData);
    }

    /**
     * Export PDF for any report type
     */
    public function exportPdf(Request $request)
    {
        $reportType = $request->get('type');
        
        switch ($reportType) {
            case 'teacher':
                return $this->exportTeacherYearlyPdf($request);
            case 'department':
                return $this->exportDepartmentPdf($request);
            case 'school':
                return $this->exportSchoolPdf($request);
            default:
                abort(400, 'Invalid report type');
        }
    }

    /**
     * FIX: Export PDF methods sử dụng helper
     */
private function exportTeacherYearlyPdf(Request $request)
{
    $validated = $request->validate([
        'teacher_id' => 'required|exists:teachers,id',
        'academic_year_id' => 'required|exists:academic_years,id'
    ]);

    // FIX: Get data và convert properly
    $reportData = $this->getTeacherYearlyData($validated['teacher_id'], $validated['academic_year_id']);
    
    // FIX: Convert arrays to objects để PDF template có thể dùng arrow notation
    $pdfData = [
        'teacher' => (object) $reportData['teacher']->toArray(),
        'academicYear' => (object) $reportData['academicYear']->toArray(),
        'salaryData' => $reportData['salaryData']->map(function ($semesterSalaries) {
            return collect($semesterSalaries)->map(function ($salary) {
                // FIX: Ensure classroom and course are objects
                $salaryArray = $salary->toArray();
                $salaryArray['classroom'] = (object) $salary->classroom->toArray();
                $salaryArray['classroom']->course = (object) $salary->classroom->course->toArray();
                return (object) $salaryArray;
            });
        })->toArray(),
        'summary' => $reportData['summary']
    ];

    // FIX: Add department and degree as objects
    if (isset($reportData['teacher']->department)) {
        $pdfData['teacher']->department = (object) $reportData['teacher']->department->toArray();
    }
    
    if (isset($reportData['teacher']->degree)) {
        $pdfData['teacher']->degree = (object) $reportData['teacher']->degree->toArray();
    }

    $pdf = Pdf::loadView('reports.teacher-yearly-pdf', $pdfData);
    $pdf->setPaper('A4', 'portrait');
    
    $filename = sprintf(
        'bao-cao-gv-%s-%s.pdf',
        \Illuminate\Support\Str::slug($reportData['teacher']->fullName),
        $reportData['academicYear']->name
    );
    
    return $pdf->download($filename);
}

    private function exportDepartmentPdf(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'academic_year_id' => 'required|exists:academic_years,id'
        ]);

        $reportData = $this->getDepartmentReportData($validated['department_id'], $validated['academic_year_id']);
        
        // FIX: Convert to array for PDF template
        $pdfData = [
            'department' => $reportData['department']->toArray(),
            'academicYear' => $reportData['academicYear']->toArray(),
            'teachersData' => $reportData['teachersData']->map(function($item) {
                return [
                    'teacher' => $item['teacher']->toArray(),
                    'totalSalary' => $item['totalSalary'],
                    'totalClasses' => $item['totalClasses'],
                    'totalLessons' => $item['totalLessons']
                ];
            })->toArray(),
            'departmentTotals' => $reportData['departmentTotals']
        ];
        
        $pdf = Pdf::loadView('reports.department-pdf', $pdfData);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = sprintf(
            'bao-cao-khoa-%s-%s.pdf',
            \Illuminate\Support\Str::slug($reportData['department']->name),
            $reportData['academicYear']->name
        );
        
        return $pdf->download($filename);
    }

    private function exportSchoolPdf(Request $request)
    {
        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id'
        ]);

        $reportData = $this->getSchoolReportData($validated['academic_year_id']);
        
        // FIX: Convert to array for PDF template
        $pdfData = [
            'academicYear' => $reportData['academicYear']->toArray(),
            'departmentsData' => $reportData['departmentsData']->map(function($item) {
                return [
                    'department' => $item['department']->toArray(),
                    'teachersCount' => $item['teachersCount'],
                    'totalSalary' => $item['totalSalary'],
                    'totalClasses' => $item['totalClasses'],
                    'totalLessons' => $item['totalLessons'],
                    'teachers' => collect($item['teachers'])->map(function($teacher) {
                        return [
                            'teacher' => $teacher['teacher']->toArray(),
                            'totalSalary' => $teacher['totalSalary'],
                            'totalClasses' => $teacher['totalClasses'],
                            'totalLessons' => $teacher['totalLessons']
                        ];
                    })->toArray()
                ];
            })->toArray(),
            'schoolTotals' => $reportData['schoolTotals']
        ];
        
        $pdf = Pdf::loadView('reports.school-pdf', $pdfData);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = sprintf(
            'bao-cao-toan-truong-%s.pdf',
            $reportData['academicYear']->name
        );
        
        return $pdf->download($filename);
    }
}