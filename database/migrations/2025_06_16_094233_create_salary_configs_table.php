<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_configs', function (Blueprint $table) {
            $table->id();
            $table->string('month', 7); // 2024-10
            $table->decimal('base_salary_per_lesson', 10, 2); // 50000.00
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');
            $table->timestamps();
            
            $table->unique('month'); // Mỗi tháng chỉ có 1 config
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_configs');
    }
};