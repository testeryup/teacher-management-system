<?php

namespace App\Http\Controllers;

use App\Models\SalaryConfig;
use App\Models\TeacherSalary;
use App\Services\SalaryCalculatorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        $salaryConfigs = SalaryConfig::orderBy('month', 'desc')->paginate(10);
        
        return Inertia::render('Salary/Index', [
            'salaryConfigs' => $salaryConfigs
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
            'month' => 'required|string|regex:/^\d{4}-\d{2}$/|unique:salary_configs,month',
            'base_salary_per_lesson' => 'required|numeric|min:0',
        ]);

        $salaryConfig = SalaryConfig::create([
            'month' => $validated['month'],
            'base_salary_per_lesson' => $validated['base_salary_per_lesson'],
            'status' => 'draft'
        ]);

        return redirect()->route('salary.index')
            ->with('message', 'Tạo cấu hình lương thành công');
    }

    /**
     * Tính lương cho tháng
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
            $result = $this->salaryCalculator->calculateSalariesForMonth($salaryConfig);
            
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
            'salaryConfig' => $salaryConfig,
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
        
        return back()->with('message', 'Đã đóng bảng lương tháng ' . $salaryConfig->month);
    }
}