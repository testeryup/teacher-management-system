<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator with full access']);
        $departmentHeadRole = Role::create(['name' => 'department_head', 'description' => 'Department head with access to their department']);
        $teacherRole = Role::create(['name' => 'teacher', 'description' => 'Teacher with limited access']);

        // Create permissions
        $manageUsers = Permission::create(['name' => 'manage_users', 'description' => 'Can manage all users']);
        $manageDepartments = Permission::create(['name' => 'manage_departments', 'description' => 'Can manage all departments']);
        $manageDegrees = Permission::create(['name' => 'manage_degrees', 'description' => 'Can manage all degrees']);
        $manageTeachers = Permission::create(['name' => 'manage_teachers', 'description' => 'Can manage all teachers']);
        $manageClassrooms = Permission::create(['name' => 'manage_classrooms', 'description' => 'Can manage all classrooms']);
        $manageCourses = Permission::create(['name' => 'manage_courses', 'description' => 'Can manage all courses']);
        $manageAcademicYears = Permission::create(['name' => 'manage_academic_years', 'description' => 'Can manage all academic years']);
        $manageSemesters = Permission::create(['name' => 'manage_semesters', 'description' => 'Can manage all semesters']);
        
        $manageOwnDepartmentTeachers = Permission::create(['name' => 'manage_own_department_teachers', 'description' => 'Can manage teachers in own department']);
        $manageOwnDepartmentClassrooms = Permission::create(['name' => 'manage_own_department_classrooms', 'description' => 'Can manage classrooms for own department']);
        
        $viewOwnInfo = Permission::create(['name' => 'view_own_info', 'description' => 'Can view own information']);
        $viewOwnClasses = Permission::create(['name' => 'view_own_classes', 'description' => 'Can view own classes']);

        // Assign permissions to roles
        $adminRole->permissions()->attach([
            $manageUsers->id,
            $manageDepartments->id,
            $manageDegrees->id,
            $manageTeachers->id,
            $manageClassrooms->id,
            $manageCourses->id,
            $manageAcademicYears->id,
            $manageSemesters->id,
            $manageOwnDepartmentTeachers->id,
            $manageOwnDepartmentClassrooms->id,
            $viewOwnInfo->id,
            $viewOwnClasses->id,
        ]);

        $departmentHeadRole->permissions()->attach([
            $manageOwnDepartmentTeachers->id,
            $manageOwnDepartmentClassrooms->id,
            $viewOwnInfo->id,
            $viewOwnClasses->id,
        ]);

        $teacherRole->permissions()->attach([
            $viewOwnInfo->id,
            $viewOwnClasses->id,
        ]);
    }
}
