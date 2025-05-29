<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->sentence(3),
            'credits' => $this->faker->numberBetween(1, 10),
            'lessons' => $this->faker->numberBetween(1, 100),
            'code' => strtoupper($this->faker->unique()->bothify('CS###')),
        ];
    }
}
