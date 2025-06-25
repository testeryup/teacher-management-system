<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Teacher;
use App\Models\Department;
use App\Models\TeacherSalary;
use Illuminate\Support\Collection;

class SalaryReportTest extends TestCase
{
    public function test_salary_report_totals_calculation()
    {
        // Tạo giả khoa
        $dept1 = new Department();
        $dept1->id = 1;
        $dept1->name = "CNTT";

        $dept2 = new Department();
        $dept2->id = 2;
        $dept2->name = "Kinh tế";

        // Tạo giả giáo viên
        $teacher1 = new Teacher();
        $teacher1->id = 1;
        $teacher1->department = $dept1;

        $teacher2 = new Teacher();
        $teacher2->id = 2;
        $teacher2->department = $dept2;

        // Tạo giả teacherSalary
        $salary1a = new TeacherSalary();
        $salary1a->teacher = $teacher1;
        $salary1a->total_salary = 1_000_000;
        $salary1a->converted_lessons = 10;

        $salary1b = new TeacherSalary();
        $salary1b->teacher = $teacher1;
        $salary1b->total_salary = 2_000_000;
        $salary1b->converted_lessons = 20;

        $salary2a = new TeacherSalary();
        $salary2a->teacher = $teacher2;
        $salary2a->total_salary = 3_000_000;
        $salary2a->converted_lessons = 30;

        $salary2b = new TeacherSalary();
        $salary2b->teacher = $teacher2;
        $salary2b->total_salary = 4_000_000;
        $salary2b->converted_lessons = 40;

        // Gom nhóm như getSalaryReport trả về
        $report = Collection::make([
            1 => [
                'teacher' => $teacher1,
                'classes' => Collection::make([$salary1a, $salary1b]),
                'total_salary' => 3_000_000,
                'total_classes' => 2,
                'total_lessons' => 30
            ],
            2 => [
                'teacher' => $teacher2,
                'classes' => Collection::make([$salary2a, $salary2b]),
                'total_salary' => 7_000_000,
                'total_classes' => 2,
                'total_lessons' => 70
            ],
        ]);

        // Tính tổng toàn trường
        $totalStats = $report->reduce(function ($carry, $item) {
            return [
                'totalTeachers' => ($carry['totalTeachers'] ?? 0) + 1,
                'totalClasses' => ($carry['totalClasses'] ?? 0) + $item['total_classes'],
                'totalLessons' => ($carry['totalLessons'] ?? 0) + $item['total_lessons'],
                'totalSalary' => ($carry['totalSalary'] ?? 0) + $item['total_salary']
            ];
        }, ['totalTeachers' => 0, 'totalClasses' => 0, 'totalLessons' => 0, 'totalSalary' => 0]);

        echo "\n== TOÀN TRƯỜNG ==";
        echo "\nTotal Teachers: {$totalStats['totalTeachers']} (expected 2)";
        echo "\nTotal Classes: {$totalStats['totalClasses']} (expected 4)";
        echo "\nTotal Lessons: {$totalStats['totalLessons']} (expected 100)";
        echo "\nTotal Salary: {$totalStats['totalSalary']} (expected 10000000)\n";

        $this->assertEquals(2, $totalStats['totalTeachers']);
        $this->assertEquals(4, $totalStats['totalClasses']);
        $this->assertEquals(100, $totalStats['totalLessons']);
        $this->assertEquals(10_000_000, $totalStats['totalSalary']);

        // Tính tổng theo khoa CNTT
        $cnttReport = $report->filter(fn($item) => $item['teacher']->department->id === 1);

        $cnttStats = $cnttReport->reduce(function ($carry, $item) {
            return [
                'totalTeachers' => ($carry['totalTeachers'] ?? 0) + 1,
                'totalClasses' => ($carry['totalClasses'] ?? 0) + $item['total_classes'],
                'totalLessons' => ($carry['totalLessons'] ?? 0) + $item['total_lessons'],
                'totalSalary' => ($carry['totalSalary'] ?? 0) + $item['total_salary']
            ];
        }, ['totalTeachers' => 0, 'totalClasses' => 0, 'totalLessons' => 0, 'totalSalary' => 0]);

        echo "\n== KHOA CNTT ==";
        echo "\nTotal Teachers: {$cnttStats['totalTeachers']} (expected 1)";
        echo "\nTotal Classes: {$cnttStats['totalClasses']} (expected 2)";
        echo "\nTotal Lessons: {$cnttStats['totalLessons']} (expected 30)";
        echo "\nTotal Salary: {$cnttStats['totalSalary']} (expected 3000000)\n";

        $this->assertEquals(1, $cnttStats['totalTeachers']);
        $this->assertEquals(2, $cnttStats['totalClasses']);
        $this->assertEquals(30, $cnttStats['totalLessons']);
        $this->assertEquals(3_000_000, $cnttStats['totalSalary']);
    }
}
