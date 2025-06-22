<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ReportController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('role:admin,department_head,teacher,accountant')->name('dashboard');

    //department
    Route::middleware('role:admin')->group(function (){
        Route::get('/departments', [DepartmentController::class, "index"])->name('departments.index');
        Route::post('/departments', [DepartmentController::class, "store"])->name('departments.store');
        Route::delete('/departments/{department}', [DepartmentController::class, "destroy"])->name('departments.destroy');
            // CN02 - QL Lop hoc & mon hoc
        Route::get('/academicyears', [AcademicYearController::class, 'index'])->name('academicyears.index');
        Route::post('/academicyears', [AcademicYearController::class, 'store'])->name('academicyears.store');
        Route::delete('/academicyears/{academicyear}', [AcademicYearController::class, 'destroy'])->name('academicyears.destroy');
        Route::put('/academicyears/{academicyear}', [AcademicYearController::class, 'update'])->name('academicyears.update');

        Route::get('/semesters', [SemesterController::class, 'index'])->name('semesters.index');
        Route::post('/semesters', [SemesterController::class, 'store'])->name('semesters.store');
        Route::delete('/semesters/{semester}', [SemesterController::class, 'destroy'])->name('semesters.destroy');
        Route::put('/semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');

        Route::get('/salary', [SalaryController::class, 'index'])->name('salary.index');
        Route::post('/salary', [SalaryController::class, 'store'])->name('salary.store');
        Route::post('/salary/{salaryConfig}/calculate', [SalaryController::class, 'calculate'])->name('salary.calculate');
        Route::get('/salary/{salaryConfig}/report', [SalaryController::class, 'report'])->name('salary.report');
        Route::patch('/salary/{salaryConfig}/close', [SalaryController::class, 'close'])->name('salary.close');
        Route::put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');

        Route::get('/salary/{salaryConfig}/export-pdf', [SalaryController::class, 'exportPdf'])
            ->name('salary.export-pdf');
            
        Route::get('/salary/{salaryConfig}/preview-pdf', [SalaryController::class, 'previewPdf'])
            ->name('salary.preview-pdf');
    });
    // FIX: Teacher routes - Thêm routes mới cho giáo viên
    Route::middleware('role:teacher')->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/classrooms', [ClassroomController::class, 'teacherClassrooms'])->name('classrooms');
        Route::get('/salary', [SalaryController::class, 'teacherSalary'])->name('salary');
        
        // FIX: Teacher reports routes
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'teacherReportsIndex'])->name('index');
            Route::get('/{academicYear}', [ReportController::class, 'teacherYearly'])->name('yearly');
            Route::get('/{academicYear}/pdf', [ReportController::class, 'exportTeacherYearlyPdfForTeacher'])->name('yearly.pdf');
        });
    });
    
    Route::middleware('role:admin,department_head')->group(function (){
        //degree
        Route::get('/degrees', [DegreeController::class, 'index'])->name('degrees.index');
        Route::post('/degrees', [DegreeController::class, 'store'])->name('degrees.store');
        Route::delete('/degrees/{degree}', [DegreeController::class, 'destroy'])->name('degrees.destroy');
        Route::put('/degrees/{degree}', [DegreeController::class, 'update'])->name('degrees.update');

        //teacher
        Route::get('/teachers', [TeacherController::class, 'index'])->name('teachers.index');
        Route::post('/teachers', [TeacherController::class, 'store'])->name('teachers.store');
        Route::delete('/teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy');
        Route::put('/teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
    
        Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
        Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
        
        Route::get('/classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
        Route::post('/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
        Route::post('/classrooms/bulk', [ClassroomController::class, 'bulkStore'])->name('classrooms.bulk-store'); // Thêm route này
        Route::delete('/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');
        Route::put('/classrooms/{classroom}', [ClassroomController::class, 'update'])->name('classrooms.update');
        Route::get('/classrooms/filter', [ClassroomController::class, 'filter'])->name('classrooms.filter');
        Route::get('/classrooms/semesters-by-year', [ClassroomController::class, 'getSemestersByAcademicYear'])
            ->name('classrooms.semesters-by-year');

        // UC4 - Reports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            
            // UC4.1 - Teacher yearly report
            Route::get('/teacher-yearly', [ReportController::class, 'teacherYearlyReport'])->name('teacher-yearly');
            
            // UC4.2 - Department report  
            Route::get('/department', [ReportController::class, 'departmentReport'])->name('department');
            
            // UC4.3 - School report
            Route::get('/school', [ReportController::class, 'schoolReport'])->name('school');
            
            // Export PDFs
            Route::get('/export-pdf', [ReportController::class, 'exportPdf'])->name('export-pdf');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
