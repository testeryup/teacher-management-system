<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

// Route::middleware('auth:sanctum')->group(function () {
    
// });

Route::get('reports', [DashboardController::class, 'apiIndex'])
        ->name('api.apiIndex');
Route::middleware(['auth', 'verified'])->group(function () {

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';