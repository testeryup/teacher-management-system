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
        // Delete any classrooms that belong to summer semesters first
        DB::table('classrooms')
            ->whereIn('semester_id', function($query) {
                $query->select('id')
                      ->from('semesters')
                      ->where('name', 'Học kỳ hè');
            })
            ->delete();

        // Delete summer semesters (Học kỳ hè)
        DB::table('semesters')
            ->where('name', 'Học kỳ hè')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration cannot be easily reversed 
        // as we would need to recreate the deleted data
        // You would need to manually restore the data if needed
    }
};
