<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('semesters', function(Blueprint $table){
            $table->dropForeign(['academicYear_id']);
            $table->foreign('academicYear_id')
                ->references('id')
                ->on('academic_years')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropForeign(['academicYear_id']);

            $table->foreign('academicYear_id')
                  ->references('id')
                  ->on('academic_years')
                  ->onDelete('restrict');
        });
    }
};
