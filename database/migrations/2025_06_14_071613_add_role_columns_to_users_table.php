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
        Schema::table('users', function (Blueprint $table) {
            // Add department_id for department heads
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null')->after('email_verified_at');
            
            // Add role enum column (optional - you can use this instead of the roles table approach)
            $table->enum('role', ['admin', 'department_head', 'user'])->default('user')->after('department_id');
            
            // Add status column
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['department_id', 'role', 'is_active']);
        });
    }
};
