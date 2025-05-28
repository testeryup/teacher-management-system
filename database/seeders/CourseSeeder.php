<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            ['name' => 'Lập trình Web', 'code' => 'WEB101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Cơ sở dữ liệu', 'code' => 'DB101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Lập trình hướng đối tượng', 'code' => 'OOP101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Cấu trúc dữ liệu và giải thuật', 'code' => 'DSA101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Mạng máy tính', 'code' => 'NET101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Hệ điều hành', 'code' => 'OS101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Phân tích thiết kế hệ thống', 'code' => 'SAD101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Kiểm thử phần mềm', 'code' => 'TEST101', 'credits' => 2, 'lessons' => 30],
            ['name' => 'Trí tuệ nhân tạo', 'code' => 'AI101', 'credits' => 3, 'lessons' => 45],
            ['name' => 'Machine Learning', 'code' => 'ML101', 'credits' => 3, 'lessons' => 45],
        ];

        foreach ($courses as $course) {
            Course::updateOrCreate(
                ['code' => $course['code']],
                $course
            );
        }
    }
}
