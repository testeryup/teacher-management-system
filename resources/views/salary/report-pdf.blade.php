<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo lương - {{ isset($salaryConfig->semester->name) ? $salaryConfig->semester->name : 'NA' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .header .subtitle {
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .header .info {
            font-size: 13px;
            color: #666;
        }
        
        .summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        
        .summary-item {
            text-align: center;
            flex: 1;
        }
        
        .summary-item .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .summary-item .value {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .teacher-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .teacher-header {
            background-color: #3b82f6;
            color: white;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 3px;
        }
        
        .teacher-name {
            font-size: 16px;
            font-weight: bold;
        }
        
        .teacher-dept {
            font-size: 13px;
            opacity: 0.9;
        }
        
        .teacher-total {
            float: right;
            font-size: 16px;
            font-weight: bold;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #f1f5f9;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
        }
        
        td {
            font-size: 12px;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .currency {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        
        .teacher-summary {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 10px;
        }
        
        .teacher-summary-item {
            display: inline-block;
            margin-right: 20px;
            font-size: 13px;
        }
        
        .teacher-summary-label {
            font-weight: bold;
            color: #374151;
        }
        
        .teacher-summary-value {
            color: #059669;
            font-weight: bold;
        }
        
        .footer {
            position: fixed;
            bottom: 30px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Báo cáo lương giảng viên</h1>
        <div class="subtitle">{{ isset($salaryConfig->semester->name) ?  $salaryConfig->semester->name : 'NA'}} - {{ isset($salaryConfig->semester->academicYear->name) ? $salaryConfig->semester->academicYear->name : 'NA' }}</div>
        <div class="info">
            Trạng thái: {{ $statusLabels[$salaryConfig->status] ?? $salaryConfig->status }} | 
            Tiền/tiết: {{ number_format($salaryConfig->base_salary_per_lesson, 0, ',', '.') }}.VND |
            Ngày xuất: {{ now()->format('d/m/Y H:i') }}
        </div>
    </div>

    <!-- Summary -->
    <div class="summary">
        <div class="summary-item">
            <div class="label">Tổng giảng viên</div>
            <div class="value">{{ $totalStats['totalTeachers'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Tổng lớp học</div>
            <div class="value">{{ $totalStats['totalClasses'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Tổng tiết quy đổi</div>
            <div class="value">{{ number_format($totalStats['totalLessons'], 1, ',', '.') }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Tổng lương</div>
            <div class="value currency">{{ number_format($totalStats['totalSalary'], 0, ',', '.') }}.VND</div>
        </div>
    </div>

    <!-- Teacher Details -->
    @foreach($salaryReport as $teacherId => $teacherData)
        <div class="teacher-section no-break">
            <div class="teacher-header">
                <span class="teacher-name">{{ $teacherData['teacher']->fullName }}</span>
                <span class="teacher-dept">{{ $teacherData['teacher']->department->name }} ({{ $teacherData['teacher']->department->abbrName }})</span>
                <span class="teacher-total">{{ number_format($teacherData['total_salary'], 0, ',', '.') }}.VND</span>
            </div>
            
            <div class="teacher-summary">
                <span class="teacher-summary-item">
                    <span class="teacher-summary-label">Số lớp:</span>
                    <span class="teacher-summary-value">{{ $teacherData['total_classes'] }}</span>
                </span>
                <span class="teacher-summary-item">
                    <span class="teacher-summary-label">Tổng tiết quy đổi:</span>
                    <span class="teacher-summary-value">{{ number_format($teacherData['total_lessons'], 2, ',', '.') }}</span>
                </span>
                <span class="teacher-summary-item">
                    <span class="teacher-summary-label">Tổng lương:</span>
                    <span class="teacher-summary-value currency">{{ number_format($teacherData['total_salary'], 0, ',', '.') }}.VND</span>
                </span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 15%">Lớp học</th>
                        <th style="width: 20%">Môn học</th>
                        <th style="width: 8%">Tiết TT</th>
                        <th style="width: 8%">HS Lớp</th>
                        <th style="width: 8%">HS Môn</th>
                        <th style="width: 8%">HS GV</th>
                        <th style="width: 10%">Tiết QĐ</th>
                        <th style="width: 23%">Lương</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($teacherData['classes'] as $classItem)
                        <tr>
                            <td class="text-center">{{ $classItem->classroom->name ?? 'N/A' }}</td>
                            <td>
                                <div style="font-weight: bold;">{{ $classItem->classroom->course->name ?? 'N/A' }}</div>
                                <div style="font-size: 9px; color: #666;">{{ $classItem->classroom->course->code ?? '' }}</div>
                            </td>
                            <td class="text-center">{{ $classItem->actual_lessons ?? 0 }}</td>
                            <td class="text-center">{{ number_format($classItem->class_coefficient, 1, ',', '.') }}</td>
                            <td class="text-center">{{ number_format($classItem->course_coefficient, 1, ',', '.') }}</td>
                            <td class="text-center">{{ number_format($classItem->teacher_coefficient, 1, ',', '.') }}</td>
                            <td class="text-center">{{ number_format($classItem->converted_lessons, 2, ',', '.') }}</td>
                            <td class="text-right currency">{{ number_format($classItem->total_salary, 0, ',', '.') }}.VND</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach

    @if(empty($salaryReport))
        <div style="text-align: center; padding: 50px; color: #666;">
            <h3>Chưa có dữ liệu lương</h3>
            <p>Chưa có lớp học nào được tính lương trong học kỳ này.</p>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <div>Hệ thống quản lý giảng viên - Báo cáo được tạo tự động vào {{ now()->format('d/m/Y H:i:s') }}</div>
    </div>
</body>
</html>