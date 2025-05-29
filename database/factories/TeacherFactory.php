<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\Models\Degree;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition(): array
    {
        return [
            'fullName' => $this->faker->name,
            'DOB' => $this->faker->date('Y-m-d', '2000-01-01'),
            'phone' => $this->faker->numerify('0#########'),
            'email' => $this->faker->unique()->safeEmail,
            'degree_id' => Degree::factory(), // Tạo liên kết với Degree
            'department_id' => Department::factory(), // Tạo liên kết với Department
        ];
    }
}
