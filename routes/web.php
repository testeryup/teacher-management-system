<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/create', [ProductController::class, "create"])->name('products.create');
    Route::get('/products/{product}/edit', [ProductController::class, "edit"])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, "update"])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    //department
    Route::get('/departments', [DepartmentController::class, "index"])->name('departments.index');
    Route::post('/departments', [DepartmentController::class, "store"])->name('departments.store');
    Route::delete('/departments/{department}', [DepartmentController::class, "destroy"])->name('departments.destroy');
    
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


    //report
    // Route::get('/', [TeacherController::class, 'index'])->name('teachers.index');

    Route::get('/api/reports', [DashboardController::class, 'index'])
        ->name('dashboard.reports');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
