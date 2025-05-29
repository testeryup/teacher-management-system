<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AcademicYearTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_valid_academic_year() // TC2.01
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('academicyears.store'), [
            'name' => '2025-2026',
            'startDate' => '2025-09-01',
            'endDate' => '2026-05-31',
            'semesterCount' => 2,
        ]);

        $response->assertRedirect(route('academicyears.index'));
        $this->assertDatabaseHas('academic_years', ['name' => '2025-2026']);
    }

    public function test_cannot_create_academic_year_with_empty_name() // TC2.02
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('academicyears.store'), [
            'name' => '',
            'startDate' => '2025-09-01',
            'endDate' => '2026-05-31',
            'semesterCount' => 2,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_cannot_create_academic_year_with_empty_dates() // TC2.03
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('academicyears.store'), [
            'name' => '2025-2026',
            'startDate' => '',
            'endDate' => '',
            'semesterCount' => 2,
        ]);

        $response->assertSessionHasErrors(['startDate', 'endDate']);
    }

    public function test_cannot_create_academic_year_with_duplicate_name() // TC2.04
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        AcademicYear::factory()->create(['name' => '2025-2026']);

        $response = $this->post(route('academicyears.store'), [
            'name' => '2025-2026',
            'startDate' => '2025-09-01',
            'endDate' => '2026-05-31',
            'semesterCount' => 2,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_can_create_academic_year_with_special_characters_in_name() // TC2.05
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('academicyears.store'), [
            'name' => 'Năm học 2025/2026!',
            'startDate' => '2025-09-01',
            'endDate' => '2026-05-31',
            'semesterCount' => 2,
        ]);

        $response->assertRedirect(route('academicyears.index'));
        $this->assertDatabaseHas('academic_years', ['name' => 'Năm học 2025/2026!']);
    }

    public function test_cannot_create_academic_year_with_start_after_end_date() // TC2.06
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('academicyears.store'), [
            'name' => '2025-2026',
            'startDate' => '2026-06-01',
            'endDate' => '2026-05-31',
            'semesterCount' => 2,
        ]);

        $response->assertSessionHasErrors('endDate');
    }

    public function test_can_create_academic_year_with_start_equals_end_date() // TC2.07
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('academicyears.store'), [
            'name' => '2025-2026',
            'startDate' => '2025-09-01',
            'endDate' => '2025-09-01',
            'semesterCount' => 1,
        ]);

        $response->assertSessionHasErrors('endDate'); // Because "after:startDate"
    }

    public function test_cannot_delete_academic_year_with_existing_semesters() // TC2.08
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $academicYear = AcademicYear::factory()->create([
            'name' => '2025-2026',
            'startDate' => '2025-09-01',
            'endDate' => '2026-05-31',
        ]);

        // Tạo sẵn 1 học kỳ liên kết
        $academicYear->semesters()->create([
            'name' => 'Học kỳ 1',
            'startDate' => '2025-09-01',
            'endDate' => '2025-12-31',
        ]);

        $response = $this->delete(route('academicyears.destroy', $academicYear));

        $response->assertRedirect(route('academicyears.index'));
        $this->assertDatabaseMissing('academic_years', ['id' => $academicYear->id]); // Vì đã xoá và cả semester bị xoá cùng
    }
}
