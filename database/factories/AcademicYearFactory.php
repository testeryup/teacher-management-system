<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\AcademicYear;

class AcademicYearFactory extends Factory
{
    protected $model = AcademicYear::class;

    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 years', '+1 years');
        $endDate = (clone $startDate)->modify('+9 months');

        return [
            'name' => 'Năm học ' . $startDate->format('Y') . '-' . $endDate->format('Y'),
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ];
    }
}
