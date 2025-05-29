<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Degree;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DegreeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_degree_successfully()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('degrees.store'), [
            'name' => 'Tiến sĩ',
            'baseSalaryFactor' => 2.5,
        ]);

        $response->assertRedirect(route('degrees.index'));
        $this->assertDatabaseHas('degrees', [
            'name' => 'Tiến sĩ',
            'baseSalaryFactor' => 2.5,
        ]);
    }

    public function test_cannot_create_degree_with_duplicate_name()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Degree::factory()->create([
            'name' => 'Thạc sĩ',
        ]);

        $response = $this->post(route('degrees.store'), [
            'name' => 'Thạc sĩ', // duplicate
            'baseSalaryFactor' => 2.2,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_cannot_create_degree_with_duplicate_base_salary_factor()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Degree::factory()->create([
            'baseSalaryFactor' => 1.8,
        ]);

        $response = $this->post(route('degrees.store'), [
            'name' => 'Giáo sư',
            'baseSalaryFactor' => 1.8, // duplicate
        ]);

        $response->assertSessionHasErrors('baseSalaryFactor');
    }

    public function test_can_update_degree_successfully()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $degree = Degree::factory()->create([
            'name' => 'Cử nhân',
            'baseSalaryFactor' => 1.5,
        ]);

        $response = $this->put(route('degrees.update', $degree), [
            'name' => 'Cử nhân cập nhật',
            'baseSalaryFactor' => 1.7,
        ]);

        $response->assertRedirect(route('degrees.index'));
        $this->assertDatabaseHas('degrees', [
            'id' => $degree->id,
            'name' => 'Cử nhân cập nhật',
            'baseSalaryFactor' => 1.7,
        ]);
    }

    public function test_cannot_update_degree_with_duplicate_name()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $degree1 = Degree::factory()->create(['name' => 'A']);
        $degree2 = Degree::factory()->create(['name' => 'B']);

        $response = $this->put(route('degrees.update', $degree2), [
            'name' => 'A', // duplicate name
            'baseSalaryFactor' => $degree2->baseSalaryFactor,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_cannot_update_degree_with_duplicate_base_salary_factor()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $degree1 = Degree::factory()->create(['baseSalaryFactor' => 1.2]);
        $degree2 = Degree::factory()->create(['baseSalaryFactor' => 1.5]);

        $response = $this->put(route('degrees.update', $degree2), [
            'name' => $degree2->name,
            'baseSalaryFactor' => 1.2, // duplicate
        ]);

        $response->assertSessionHasErrors('baseSalaryFactor');
    }

    public function test_can_delete_degree_without_teachers()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $degree = Degree::factory()->create();

        $response = $this->delete(route('degrees.destroy', $degree));

        $response->assertRedirect(route('degrees.index'));
        $this->assertDatabaseMissing('degrees', ['id' => $degree->id]);
    }

    public function test_cannot_delete_degree_with_teachers()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $degree = Degree::factory()->create();
        $department = \App\Models\Department::factory()->create();

        $degree->teachers()->create([
            'fullName' => 'Test Teacher',
            'DOB' => '1990-01-01',
            'phone' => '0909123456',
            'email' => 'teacher@example.com',
            'department_id' => $department->id,
        ]);

        $response = $this->delete(route('degrees.destroy', $degree));

        $response->assertSessionHasErrors('reference');
        $this->assertDatabaseHas('degrees', ['id' => $degree->id]);
    }

}
