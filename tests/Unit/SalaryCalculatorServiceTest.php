<?php

namespace Tests\Unit;

use App\Models\Classroom;
use App\Models\Course;
use App\Models\Degree;
use App\Models\Teacher;
use App\Models\SalaryConfig;
use App\Services\SalaryCalculatorService;
use PHPUnit\Framework\TestCase;

class SalaryCalculatorServiceTest extends TestCase
{
    protected SalaryCalculatorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SalaryCalculatorService();
    }

    public function test_class_coefficient_values()
    {
        $this->assertEquals(-0.3, $this->service->calculateClassCoefficient(10));
        $this->assertEquals(-0.2, $this->service->calculateClassCoefficient(25));
        $this->assertEquals(-0.1, $this->service->calculateClassCoefficient(35));
        $this->assertEquals(0.0,  $this->service->calculateClassCoefficient(45));
        $this->assertEquals(0.1,  $this->service->calculateClassCoefficient(55));
        $this->assertEquals(0.2,  $this->service->calculateClassCoefficient(65));
        $this->assertEquals(0.3,  $this->service->calculateClassCoefficient(75));
        $this->assertEquals(0.3,  $this->service->calculateClassCoefficient(85));
    }

    public function test_salary_calculation_correct_formula()
    {
        // Giả degree
        $degree = new Degree();
        $degree->baseSalaryFactor = 2.0;

        // Giả teacher
        $teacher = new Teacher();
        $teacher->id = 1;
        $teacher->degree = $degree;

        // Giả course
        $course = new Course();
        $course->lessons = 30;
        $course->course_coefficient = 1.2;

        // Giả salary config
        $salaryConfig = new SalaryConfig();
        $salaryConfig->id = 100;
        $salaryConfig->base_salary_per_lesson = 50000;

        // Giả classroom
        $classroom = new Classroom();
        $classroom->id = 10;
        $classroom->teacher = $teacher;
        $classroom->course = $course;
        $classroom->students = 55; // Hệ số lớp 0.1

        // Tính lương
        $result = $this->service->calculateSalaryForClassroom($classroom, $salaryConfig);

        $expectedConvertedLessons = 30 * (1.2 + 0.1);
        $expectedSalary = $expectedConvertedLessons * 2.0 * 50000;

        echo "\nConverted Lessons: {$result['converted_lessons']}";
        echo "\nExpected Converted Lessons: {$expectedConvertedLessons}";
        echo "\nTotal Salary: {$result['total_salary']}";
        echo "\nExpected Salary: {$expectedSalary}\n";

        $this->assertEquals($expectedConvertedLessons, $result['converted_lessons']);
        $this->assertEquals($expectedSalary, $result['total_salary']);
    }

    public function test_salary_calculation_with_negative_class_coefficient()
    {
        // Giả degree
        $degree = new Degree();
        $degree->baseSalaryFactor = 1.5;

        // Giả teacher
        $teacher = new Teacher();
        $teacher->id = 2;
        $teacher->degree = $degree;

        // Giả course
        $course = new Course();
        $course->lessons = 20;
        $course->course_coefficient = 1.0;

        // Giả salary config
        $salaryConfig = new SalaryConfig();
        $salaryConfig->base_salary_per_lesson = 40000;

        // Giả classroom
        $classroom = new Classroom();
        $classroom->teacher = $teacher;
        $classroom->course = $course;
        $classroom->students = 15; // Hệ số lớp -0.3

        $result = $this->service->calculateSalaryForClassroom($classroom, $salaryConfig);

        $expectedConvertedLessons = 20 * (1.0 + (-0.3));
        $expectedSalary = $expectedConvertedLessons * 1.5 * 40000;

        echo "\nConverted Lessons (neg coef): {$result['converted_lessons']}";
        echo "\nExpected Converted Lessons (neg coef): {$expectedConvertedLessons}";
        echo "\nTotal Salary (neg coef): {$result['total_salary']}";
        echo "\nExpected Salary (neg coef): {$expectedSalary}\n";

        $this->assertEquals($expectedConvertedLessons, $result['converted_lessons']);
        $this->assertEquals($expectedSalary, $result['total_salary']);
    }

    public function test_throws_exception_when_missing_teacher_or_course()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Lớp học chưa có giáo viên hoặc môn học');

        $salaryConfig = new SalaryConfig();
        $salaryConfig->base_salary_per_lesson = 50000;

        $classroom = new Classroom();
        $classroom->teacher = null;
        $classroom->course = null;
        $classroom->students = 40;

        $this->service->calculateSalaryForClassroom($classroom, $salaryConfig);
    }
}
