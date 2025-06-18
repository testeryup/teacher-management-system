<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salary_configs', function (Blueprint $table) {
            // Xóa cột month và unique constraint
            // $table->dropUnique(['month']);
            // $table->dropColumn('month');
            
            // Thêm cột semester_id
            // $table->foreignId('semester_id')->after('id')->constrained('semesters')->onDelete('cascade');
            $table->unique('semester_id'); // Mỗi học kỳ chỉ có 1 config
        });
    }

    public function down(): void
    {
        Schema::table('salary_configs', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropUnique(['semester_id']);
            $table->dropColumn('semester_id');
            
            $table->string('month', 7)->after('id');
            $table->unique('month');
        });
    }
};