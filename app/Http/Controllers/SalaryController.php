<?php

namespace App\Http\Controllers;

use App\Models\SalaryConfig;
use App\Models\TeacherSalary;
use App\Models\Semester;
use App\Services\SalaryCalculatorService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class SalaryController extends Controller
{
    protected $salaryCalculator;

    public function __construct(SalaryCalculatorService $salaryCalculator)
    {
        $this->salaryCalculator = $salaryCalculator;
    }

    /**
     * Hiển thị danh sách cấu hình lương
     */
    public function index()
        {
            $user = auth()->user();
            
            if (!$user->isAdmin()) {
                abort(403, 'Chỉ Admin mới có quyền quản lý lương');
            }

            // FIX: Load relationship đúng cách
            $salaryConfigs = SalaryConfig::with(['semester.academicYear'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);
            
            // FIX: Load relationship và transform data properly
            $semesters = Semester::with('academicYear')
                ->whereNotIn('id', SalaryConfig::pluck('semester_id'))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($semester) {
                    return [
                        'id' => $semester->id,
                        'name' => $semester->name,
                        'startDate' => $semester->startDate,
                        'endDate' => $semester->endDate,
                        'academicYear_id' => $semester->academicYear_id,
                        'academicYear' => $semester->academicYear ? [
                            'id' => $semester->academicYear->id,
                            'name' => $semester->academicYear->name,
                            'startDate' => $semester->academicYear->startDate,
                            'endDate' => $semester->academicYear->endDate,
                        ] : null,
                        'created_at' => $semester->created_at,
                        'updated_at' => $semester->updated_at,
                    ];
                });
            
            // DEBUG: Log để kiểm tra
            // \Log::info('Semesters data:', $semesters->toArray());
            
            return Inertia::render('Salary/Index', [
                'salaryConfigs' => $salaryConfigs,
                'semesters' => $semesters->toArray()
            ]);
        }

    /**
     * Tạo cấu hình lương mới
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->isAdmin()) {
            abort(403, 'Chỉ Admin mới có quyền tạo cấu hình lương');
        }

        $validated = $request->validate([
            'semester_id' => 'required|integer|exists:semesters,id|unique:salary_configs,semester_id',
            'base_salary_per_lesson' => 'required|numeric|min:0',
        ]);

        $salaryConfig = SalaryConfig::create([
            'semester_id' => $validated['semester_id'],
            'base_salary_per_lesson' => $validated['base_salary_per_lesson'],
            'status' => 'draft'
        ]);

        return redirect()->route('salary.index')
            ->with('message', 'Tạo cấu hình lương thành công');
    }

    /**
     * Tính lương cho học kỳ
     */
    public function calculate(Request $request, SalaryConfig $salaryConfig)
    {
        $user = auth()->user();
        
        if (!$user->isAdmin()) {
            abort(403, 'Chỉ Admin mới có quyền tính lương');
        }

        if ($salaryConfig->status === 'closed') {
            return back()->withErrors(['status' => 'Không thể tính lại lương đã đóng']);
        }

        try {
            $result = $this->salaryCalculator->calculateSalariesForSemester($salaryConfig);
            
            // Cập nhật status
            $salaryConfig->update(['status' => 'active']);

            $message = "Tính lương thành công! ";
            $message .= "Đã tính: {$result['total_calculated']} lớp học. ";
            
            if ($result['total_errors'] > 0) {
                $message .= "Lỗi: {$result['total_errors']} lớp học.";
            }

            return redirect()->route('salary.report', $salaryConfig)
                ->with('message', $message);
                
        } catch (\Exception $e) {
            return back()->withErrors(['calculation' => 'Lỗi tính lương: ' . $e->getMessage()]);
        }
    }

    /**
     * Xem báo cáo lương
     */
    public function report(SalaryConfig $salaryConfig)
    {
        $user = auth()->user();
        
        // Admin xem tất cả, department_head chỉ xem thuộc khoa
        if ($user->isAdmin()) {
            $salaryReport = $this->salaryCalculator->getSalaryReport($salaryConfig);
        } elseif ($user->isDepartmentHead()) {
            $salaryReport = $this->salaryCalculator->getSalaryReport($salaryConfig)
                ->filter(function ($item) use ($user) {
                    return $item['teacher']->department_id === $user->department_id;
                });
        } else {
            abort(403, 'Bạn không có quyền xem báo cáo lương');
        }

        return Inertia::render('Salary/Report', [
            'salaryConfig' => $salaryConfig->load(['semester.academicYear']),
            'salaryReport' => $salaryReport
        ]);
    }

    /**
     * Đóng bảng lương (không cho sửa nữa)
     */
    public function close(SalaryConfig $salaryConfig)
    {
        $user = auth()->user();
        
        if (!$user->isAdmin()) {
            abort(403, 'Chỉ Admin mới có quyền đóng bảng lương');
        }

        $salaryConfig->update(['status' => 'closed']);
        
        return back()->with('message', 'Đã đóng bảng lương học kỳ ' . $salaryConfig->semester->name);
    }

    /**
     * Xuất báo cáo PDF
     */
    public function exportPdf(SalaryConfig $salaryConfig)
    {
        $user = auth()->user();
        
        // Kiểm tra quyền truy cập
        if (!$user->isAdmin() && !$user->isDepartmentHead()) {
            abort(403, 'Bạn không có quyền xuất báo cáo lương');
        }

        // Lấy dữ liệu báo cáo
        if ($user->isAdmin()) {
            $salaryReport = $this->salaryCalculator->getSalaryReport($salaryConfig);
        } elseif ($user->isDepartmentHead()) {
            $salaryReport = $this->salaryCalculator->getSalaryReport($salaryConfig)
                ->filter(function ($item) use ($user) {
                    return $item['teacher']->department_id === $user->department_id;
                });
        }

        // Tính toán thống kê tổng
        $totalStats = $salaryReport->reduce(function ($carry, $teacherData) {
            return [
                'totalTeachers' => ($carry['totalTeachers'] ?? 0) + 1,
                'totalClasses' => ($carry['totalClasses'] ?? 0) + $teacherData['total_classes'],
                'totalLessons' => ($carry['totalLessons'] ?? 0) + $teacherData['total_lessons'],
                'totalSalary' => ($carry['totalSalary'] ?? 0) + $teacherData['total_salary']
            ];
        }, ['totalTeachers' => 0, 'totalClasses' => 0, 'totalLessons' => 0, 'totalSalary' => 0]);

        // Labels cho trạng thái
        $statusLabels = [
            'draft' => 'Bản nháp',
            'active' => 'Đã tính',
            'closed' => 'Đã đóng'
        ];

        // Load relationships
        $salaryConfig->load(['semester.academicYear']);

        // Tạo PDF
        $pdf = Pdf::loadView('salary.report-pdf', [
            'salaryConfig' => $salaryConfig,
            'salaryReport' => $salaryReport,
            'totalStats' => $totalStats,
            'statusLabels' => $statusLabels
        ]);

        // Cấu hình PDF
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'dpi' => 150,
            'defaultFont' => 'DejaVu Sans',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        // Tên file PDF
       $filename = sprintf(
            'bao-cao-luong-%s-%s.pdf',
            Str::slug($salaryConfig->semester->name),
            now()->format('Y-m-d')
        );

        // Trả về PDF download
        return $pdf->download($filename);
    }

    /**
     * Xem trước PDF (stream)
     */
    public function previewPdf(SalaryConfig $salaryConfig)
    {
        $user = auth()->user();
        
        if (!$user->isAdmin() && !$user->isDepartmentHead()) {
            abort(403, 'Bạn không có quyền xem báo cáo lương');
        }

        // Same logic as exportPdf but stream instead of download
        if ($user->isAdmin()) {
            $salaryReport = $this->salaryCalculator->getSalaryReport($salaryConfig);
        } elseif ($user->isDepartmentHead()) {
            $salaryReport = $this->salaryCalculator->getSalaryReport($salaryConfig)
                ->filter(function ($item) use ($user) {
                    return $item['teacher']->department_id === $user->department_id;
                });
        }

        $totalStats = $salaryReport->reduce(function ($carry, $teacherData) {
            return [
                'totalTeachers' => ($carry['totalTeachers'] ?? 0) + 1,
                'totalClasses' => ($carry['totalClasses'] ?? 0) + $teacherData['total_classes'],
                'totalLessons' => ($carry['totalLessons'] ?? 0) + $teacherData['total_lessons'],
                'totalSalary' => ($carry['totalSalary'] ?? 0) + $teacherData['total_salary']
            ];
        }, ['totalTeachers' => 0, 'totalClasses' => 0, 'totalLessons' => 0, 'totalSalary' => 0]);

        $statusLabels = [
            'draft' => 'Bản nháp',
            'active' => 'Đã tính',
            'closed' => 'Đã đóng'
        ];

        $salaryConfig->load(['semester.academicYear']);

        $pdf = Pdf::loadView('salary.report-pdf', [
            'salaryConfig' => $salaryConfig,
            'salaryReport' => $salaryReport,
            'totalStats' => $totalStats,
            'statusLabels' => $statusLabels
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'dpi' => 150,
            'defaultFont' => 'DejaVu Sans',
        ]);

        // Stream PDF để xem trước
        return $pdf->stream('bao-cao-luong-preview.pdf');
    }
}