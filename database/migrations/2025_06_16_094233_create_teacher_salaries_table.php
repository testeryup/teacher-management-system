<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->foreignId('salary_config_id')->constrained('salary_configs')->onDelete('cascade');
            $table->integer('actual_lessons'); // Số tiết thực tế
            $table->decimal('class_coefficient', 3, 1); // Hệ số lớp (-0.3 đến 0.3)
            $table->decimal('course_coefficient', 3, 1); // Hệ số học phần (1.0-1.5)
            $table->decimal('teacher_coefficient', 3, 1); // Hệ số giáo viên
            $table->decimal('converted_lessons', 8, 2); // Số tiết quy đổi
            $table->decimal('total_salary', 12, 2); // Tổng tiền
            $table->timestamps();
            
            // Unique: mỗi giáo viên chỉ có 1 record cho 1 lớp trong 1 tháng
            $table->unique(['teacher_id', 'classroom_id', 'salary_config_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_salaries');
    }
};