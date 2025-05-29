<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
class TeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_teacher_successfully()
    {
        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $degree = Degree::factory()->create();
        $department = Department::factory()->create();

        $response = $this->post(route('teachers.store'), [
            'fullName' => 'Nguyen Van A',
            'DOB' => '1990-01-01',
            'phone' => '0912345678',
            'email' => 'nva@example.com',
            'degree_id' => $degree->id,
            'department_id' => $department->id,
        ]);

        $response->assertRedirect(route('teachers.index'));
        $this->assertDatabaseHas('teachers', ['email' => 'nva@example.com']);
    }

    public function test_cannot_create_teacher_with_duplicate_email()
    {
        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $degree = Degree::factory()->create();
        $department = Department::factory()->create();

        Teacher::factory()->create([
            'email' => 'duplicate@example.com',
            'phone' => '0999999999',
        ]);

        $response = $this->post(route('teachers.store'), [
            'fullName' => 'Nguyen Van B',
            'DOB' => '1991-01-01',
            'phone' => '0888888888',
            'email' => 'duplicate@example.com', // duplicate email
            'degree_id' => $degree->id,
            'department_id' => $department->id,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_cannot_create_teacher_with_duplicate_phone()
    {

        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $degree = Degree::factory()->create();
        $department = Department::factory()->create();

        Teacher::factory()->create([
            'email' => 'someone@example.com',
            'phone' => '0911111111',
        ]);

        $response = $this->post(route('teachers.store'), [
            'fullName' => 'Nguyen Van C',
            'DOB' => '1992-02-02',
            'phone' => '0911111111', // duplicate phone
            'email' => 'unique@example.com',
            'degree_id' => $degree->id,
            'department_id' => $department->id,
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_cannot_create_teacher_with_non_numeric_phone()
    {
        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $degree = Degree::factory()->create();
        $department = Department::factory()->create();

        $response = $this->post(route('teachers.store'), [
            'fullName' => 'Nguyen Van D',
            'DOB' => '1993-03-03',
            'phone' => 'invalid-phone', // invalid format
            'email' => 'invalidphone@example.com',
            'degree_id' => $degree->id,
            'department_id' => $department->id,
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_cannot_create_teacher_with_missing_fields()
    {
        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $response = $this->post(route('teachers.store'), [
            'fullName' => '',
            'email' => '',
        ]);

        $response->assertSessionHasErrors([
            'fullName', 'DOB', 'phone', 'email', 'degree_id', 'department_id'
        ]);
    }

    public function test_can_update_teacher_successfully()
    {
        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $teacher = Teacher::factory()->create();
        $degree = Degree::factory()->create();
        $department = Department::factory()->create();

        $response = $this->put(route('teachers.update', $teacher), [
            'fullName' => 'Updated Name',
            'DOB' => '1995-05-05',
            'phone' => '0900000000',
            'email' => 'updated@example.com',
            'degree_id' => $degree->id,
            'department_id' => $department->id,
        ]);

        $response->assertRedirect(route('teachers.index'));
        $this->assertDatabaseHas('teachers', ['email' => 'updated@example.com']);
    }

    public function test_cannot_update_teacher_with_duplicate_email()
    {
        $user = User::factory()->create(); // Tạo user giả
        $this->actingAs($user);           // Giả lập đăng nhập

        $teacher1 = Teacher::factory()->create(['email' => 'teacher1@example.com']);
        $teacher2 = Teacher::factory()->create(['email' => 'teacher2@example.com']);

        $response = $this->put(route('teachers.update', $teacher2), [
            'fullName' => $teacher2->fullName,
            'DOB' => $teacher2->DOB,
            'phone' => $teacher2->phone,
            'email' => 'teacher1@example.com', // duplicate email
            'degree_id' => $teacher2->degree_id,
            'department_id' => $teacher2->department_id,
        ]);

        $response->assertSessionHasErrors('email');
    }
}
