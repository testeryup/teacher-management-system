<?php

namespace App\Services;

use App\Models\Classroom;
use App\Models\SalaryConfig;
use App\Models\TeacherSalary;

class SalaryCalculatorService
{
    /**
     * Tính hệ số lớp dựa trên số sinh viên
     */
    public function calculateClassCoefficient(int $studentCount): float
    {
        return match(true) {
            $studentCount < 20 => -0.3,
            $studentCount < 30 => -0.2,
            $studentCount < 40 => -0.1,
            $studentCount < 50 => 0.0,
            $studentCount < 60 => 0.1,
            $studentCount < 70 => 0.2,
            $studentCount < 80 => 0.3,
            default => 0.3 // >= 80 sinh viên
        };
    }

    /**
     * Tính lương cho 1 lớp học của giáo viên
     */
    public function calculateSalaryForClassroom(Classroom $classroom, SalaryConfig $salaryConfig): array
    {
        // Lấy thông tin cần thiết
        $teacher = $classroom->teacher;
        $course = $classroom->course;
        
        if (!$teacher || !$course) {
            throw new \Exception("Lớp học chưa có giáo viên hoặc môn học");
        }

        // Các hệ số
        $actualLessons = $course->lessons; // Số tiết thực tế
        $courseCoefficient = $course->course_coefficient; // Hệ số học phần
        $classCoefficient = $this->calculateClassCoefficient($classroom->students); // Hệ số lớp
        $teacherCoefficient = $teacher->degree->baseSalaryFactor; // Hệ số giáo viên
        
        // Tính toán theo công thức
        $convertedLessons = $actualLessons * ($courseCoefficient + $classCoefficient);
        $totalSalary = $convertedLessons * $teacherCoefficient * $salaryConfig->base_salary_per_lesson;

        return [
            'teacher_id' => $teacher->id,
            'classroom_id' => $classroom->id,
            'salary_config_id' => $salaryConfig->id,
            'actual_lessons' => $actualLessons,
            'class_coefficient' => $classCoefficient,
            'course_coefficient' => $courseCoefficient,
            'teacher_coefficient' => $teacherCoefficient,
            'converted_lessons' => $convertedLessons,
            'total_salary' => $totalSalary
        ];
    }

    /**
     * Tính lương cho tất cả lớp học trong học kỳ
     */
    public function calculateSalariesForSemester(SalaryConfig $salaryConfig): array
    {
        // FIX: Eager load tất cả relationships cần thiết
        $classrooms = Classroom::with([
            'teacher.degree', 
            'teacher.department',
            'course',
            'semester'
        ])
        ->where('semester_id', $salaryConfig->semester_id)
        ->whereNotNull('teacher_id')
        ->get();

        $results = [];
        $errors = [];
        $bulkInsertData = [];

        // FIX: Xóa dữ liệu cũ trước khi tính mới (nếu tính lại)
        if ($salaryConfig->status === 'active') {
            TeacherSalary::where('salary_config_id', $salaryConfig->id)->delete();
        }

        foreach ($classrooms as $classroom) {
            try {
                $salaryData = $this->calculateSalaryForClassroom($classroom, $salaryConfig);
                
                // FIX: Collect data để bulk insert thay vì từng query
                $bulkInsertData[] = array_merge($salaryData, [
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $results[] = $salaryData;
            } catch (\Exception $e) {
                $errors[] = [
                    'classroom_id' => $classroom->id,
                    'classroom_name' => $classroom->name,
                    'error' => $e->getMessage()
                ];
            }
        }

        // FIX: Bulk insert thay vì N queries
        if (!empty($bulkInsertData)) {
            TeacherSalary::insert($bulkInsertData);
        }

        return [
            'success' => $results,
            'errors' => $errors,
            'total_calculated' => count($results),
            'total_errors' => count($errors)
        ];
    }

    /**
     * Lấy báo cáo lương theo học kỳ
     */
    public function getSalaryReport(SalaryConfig $salaryConfig)
    {
        return TeacherSalary::with(['teacher.department', 'classroom.course'])
            ->where('salary_config_id', $salaryConfig->id)
            ->get()
            ->groupBy('teacher_id')
            ->map(function ($salaries) {
                $teacher = $salaries->first()->teacher;
                $totalSalary = $salaries->sum('total_salary');
                $totalClasses = $salaries->count();
                $totalLessons = $salaries->sum('converted_lessons');

                return [
                    'teacher' => $teacher,
                    'classes' => $salaries,
                    'total_salary' => $totalSalary,
                    'total_classes' => $totalClasses,
                    'total_lessons' => $totalLessons
                ];
            });
    }
}