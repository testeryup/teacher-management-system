<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_course_successfully()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('courses.store'), [
            'name' => 'Cơ sở dữ liệu',
            'credits' => 3,
            'lessons' => 45,
        ]);

        $response->assertRedirect(route('courses.index'));
        $this->assertDatabaseHas('courses', [
            'name' => 'Cơ sở dữ liệu',
            'credits' => 3,
            'lessons' => 45,
        ]);
    }

    public function test_cannot_create_course_with_invalid_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('courses.store'), [
            'name' => '', // empty
            'credits' => -1, // invalid
            'lessons' => 0, // invalid
        ], ['Accept' => 'text/html']); // giả lập trình duyệt

        $response->assertSessionHasErrors(['name', 'credits', 'lessons']);
    }

    public function test_cannot_create_course_with_duplicate_name()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Course::factory()->create(['name' => 'Mạng máy tính']);

        $response = $this->post(route('courses.store'), [
            'name' => 'Mạng máy tính', // duplicate
            'credits' => 4,
            'lessons' => 60,
        ], ['Accept' => 'text/html']); // giả lập trình duyệt

        $response->assertSessionHasErrors('name');
    }

    public function test_cannot_delete_course_with_classrooms()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $course = Course::factory()->create();

        $course->classrooms()->create([
            'name' => 'Lớp 1',
            'code' => 'LH001',
            'students' => 20, // bắt buộc nếu cột không cho null
            'year' => 2024,
        ]);

        $response = $this->delete(route('courses.destroy', $course));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('courses', ['id' => $course->id]);
    }

    public function test_can_delete_course_without_classrooms()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $course = Course::factory()->create();

        $response = $this->delete(route('courses.destroy', $course));

        $response->assertRedirect(route('courses.index'));
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }
}
