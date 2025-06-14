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


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('role:admin,department_head')->name('dashboard');

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

        
        // Route::put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
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
        Route::delete('/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');
        Route::put('/classrooms/{classroom}', [ClassroomController::class, 'update'])->name('classrooms.update');
        Route::get('/classrooms/filter', [ClassroomController::class, 'filter'])->name('classrooms.filter');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
