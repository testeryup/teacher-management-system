<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo cá nhân - {{ $teacher->fullName }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px; border: 1px solid #ddd; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .summary-table th, .summary-table td { padding: 10px; border: 1px solid #ddd; text-align: center; }
        .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .salary-table th, .salary-table td { padding: 8px; border: 1px solid #ddd; text-align: center; }
        .total { font-weight: bold; background-color: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h2>BÁO CÁO LƯƠNG CÁ NHÂN GIẢNG VIÊN</h2>
        <h3>{{ $teacher->fullName }} - Năm học {{ $academicYear->name }}</h3>
    </div>

    <!-- Teacher Info -->
    <table class="info-table">
        <tr>
            <td><strong>Họ tên:</strong></td>
            <td>{{ $teacher->fullName }}</td>
            <td><strong>Khoa:</strong></td>
            <td>{{ $teacher->department->name }}</td>
        </tr>
        <tr>
            <td><strong>Bằng cấp:</strong></td>
            <td>{{ $teacher->degree->name }}</td>
            <td><strong>Hệ số:</strong></td>
            <td>{{ $teacher->degree->baseSalaryFactor }}</td>
        </tr>
    </table>

    <!-- Summary -->
    <table class="summary-table">
        <tr>
            <th>Tổng lương</th>
            <th>Tổng lớp học</th>
            <th>Tổng tiết quy đổi</th>
            <th>Trung bình/lớp</th>
        </tr>
        <tr class="total">
            <td>{{ number_format($summary['totalSalary'], 0, ',', '.') }} VND</td>
            <td>{{ $summary['totalClasses'] }}</td>
            <td>{{ number_format($summary['totalLessons'], 1) }}</td>
            <td>{{ number_format($summary['averageSalaryPerClass'], 0, ',', '.') }} VND</td>
        </tr>
    </table>

    <!-- Semester Details -->
    @foreach($salaryData as $semesterName => $semesterSalaries)
        <h4>{{ $semesterName }}</h4>
        <table class="salary-table">
            <tr>
                <th>Lớp học</th>
                <th>Môn học</th>
                <th>Tiết TT</th>
                <th>HS Lớp</th>
                <th>HS Môn</th>
                <th>HS GV</th>
                <th>Tiết QĐ</th>
                <th>Lương</th>
            </tr>
            @foreach($semesterSalaries as $salary)
                <tr>
                    <td>{{ $salary->classroom->name }}</td>
                    <td>{{ $salary->classroom->course->name }}</td>
                    <td>{{ $salary->actual_lessons }}</td>
                    <td>{{ $salary->class_coefficient >= 0 ? '+' : '' }}{{ $salary->class_coefficient }}</td>
                    <td>+{{ $salary->course_coefficient }}</td>
                    <td>+{{ $salary->teacher_coefficient }}</td>
                    <td>{{ number_format($salary->converted_lessons, 1) }}</td>
                    <td>{{ number_format($salary->total_salary, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </table>
    @endforeach
</body>
</html>