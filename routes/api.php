<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Services\SalaryCalculatorService;
use App\Models\Teacher;
use App\Models\SalaryConfig;

// Route::middleware('auth:sanctum')->group(function () {
    
// });

Route::get('calc', function (){
        $service = new SalaryCalculatorService();
        $config = SalaryConfig::where('id', 3)->get()->first();

        return response()->json($service->getSalaryReport($config));
})->name('api.getSalaryReport');

Route::middleware(['auth', 'verified'])->group(function () {

});
