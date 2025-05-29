<?php

namespace Database\Factories;

use App\Models\Degree;
use Illuminate\Database\Eloquent\Factories\Factory;

class DegreeFactory extends Factory
{
    protected $model = Degree::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'baseSalaryFactor' => $this->faker->randomFloat(2, 1.0, 3.0),
        ];
    }
}
