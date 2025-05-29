<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class DepartmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_department_successfully()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('departments.store'), [
            'name' => 'Khoa CNTT',
            'abbrName' => 'CNTT',
            'description' => 'Khoa Công nghệ thông tin',
        ]);

        $response->assertRedirect(route('departments.index'));
        $this->assertDatabaseHas('departments', [
            'name' => 'Khoa CNTT',
            'abbrName' => 'CNTT',
        ]);
    }

    public function test_cannot_create_department_with_duplicate_name()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Department::factory()->create([
            'name' => 'Khoa Toán',
        ]);

        $response = $this->post(route('departments.store'), [
            'name' => 'Khoa Toán', // duplicate name
            'abbrName' => 'TOAN1',
            'description' => 'duplicate test',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_cannot_create_department_with_duplicate_abbr_name()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Department::factory()->create([
            'abbrName' => 'ABC',
        ]);

        $response = $this->post(route('departments.store'), [
            'name' => 'New Department',
            'abbrName' => 'ABC', // duplicate abbrName
            'description' => 'test',
        ]);

        $response->assertSessionHasErrors('abbrName');
    }

    public function test_can_delete_department()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $department = Department::factory()->create();

        $response = $this->delete(route('departments.destroy', $department));
        $response->assertRedirect(route('departments.index'));
        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }
}
