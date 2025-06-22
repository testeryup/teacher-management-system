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
        Schema::table('users', function (Blueprint $table) {
            // Change enum to string to avoid truncation
            $table->string('role', 20)->default('teacher')->change();
        });
        
        // FIX: Update existing 'user' roles to 'teacher' 
        DB::table('users')->where('role', 'user')->update(['role' => 'teacher']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $table->enum('role', ['admin', 'department_head', 'teacher', 'accountant'])->default('teacher')->change();
    }
};
