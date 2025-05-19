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
        Schema::table('departments', function (Blueprint $table) {
            $table->text('description')->nullable()->after('abbrName');
        });

        Schema::table('degrees', function (Blueprint $table){
            $table->dropColumn('specialization');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('degrees', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->string('specialization')->nullable();
        });
    }
};
