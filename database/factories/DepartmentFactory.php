<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company . ' Department',
            'abbrName' => strtoupper($this->faker->lexify('???')),
            'description' => $this->faker->sentence,
        ];
    }
}
