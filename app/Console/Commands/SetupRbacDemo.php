<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class SetupRbacDemo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:rbac-demo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup demo users with different roles for RBAC testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Make sure roles exist
        $adminRole = Role::where('name', 'admin')->first();
        $deptHeadRole = Role::where('name', 'department_head')->first();
        $teacherRole = Role::where('name', 'teacher')->first();
        
        if (!$adminRole || !$deptHeadRole || !$teacherRole) {
            $this->error('Please run the database seeders first to create roles');
            return 1;
        }

        // Get departments for department heads
        $departments = Department::all();
        if ($departments->isEmpty()) {
            $this->error('Please create some departments first');
            return 1;
        }

        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]
        );
        
        // Create department head users for each department
        foreach ($departments as $index => $department) {
            $deptHead = User::updateOrCreate(
                ['email' => 'dept_head_' . $department->id . '@example.com'],
                [
                    'name' => 'Department Head - ' . $department->name,
                    'password' => Hash::make('password'),
                    'role_id' => $deptHeadRole->id,
                    'department_id' => $department->id,
                    'email_verified_at' => now(),
                ]
            );
            
            $this->info("Created department head user for {$department->name}: {$deptHead->email}");
        }
        
        // Create a general teacher user
        $teacher = User::updateOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Teacher User',
                'password' => Hash::make('password'),
                'role_id' => $teacherRole->id,
                'department_id' => $departments->first()->id,
                'email_verified_at' => now(),
            ]
        );
        
        $this->info('RBAC demo users created successfully:');
        $this->info('- Admin: admin@example.com / password');
        $this->info('- Teacher: teacher@example.com / password');
        $this->info('Department heads were created for each department with emails like dept_head_X@example.com');
        
        return 0;
    }
}
