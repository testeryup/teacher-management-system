<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all existing classrooms with calculated coefficients
        $classrooms = DB::table('classrooms')->get();
        
        foreach ($classrooms as $classroom) {
            $coefficient = $this->calculateClassCoefficient($classroom->students);
            
            DB::table('classrooms')
                ->where('id', $classroom->id)
                ->update(['class_coefficient' => $coefficient]);
        }
    }

    /**
     * Calculate class coefficient based on student count
     */
    private function calculateClassCoefficient(int $students): float
    {
        if ($students < 20) {
            return -0.3;
        } elseif ($students >= 20 && $students <= 29) {
            return -0.2;
        } elseif ($students >= 30 && $students <= 39) {
            return -0.1;
        } elseif ($students >= 40 && $students <= 49) {
            return 0.0;
        } elseif ($students >= 50 && $students <= 59) {
            return 0.1;
        } elseif ($students >= 60 && $students <= 69) {
            return 0.2;
        } elseif ($students >= 70 && $students <= 79) {
            return 0.3;
        } else {
            // For students >= 80, use highest coefficient
            return 0.3;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset all class coefficients to 0
        DB::table('classrooms')->update(['class_coefficient' => 0]);
    }
};
