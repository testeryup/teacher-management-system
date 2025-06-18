<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo khoa - {{ $department['name'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'DejaVu Sans', sans-serif; 
            font-size: 11px; 
            line-height: 1.3;
            color: #333;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 25px; 
            border-bottom: 2px solid #333; 
            padding-bottom: 15px; 
        }
        
        .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .header .subtitle {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
        }
        
        .summary-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .summary-item {
            display: table-cell;
            width: 20%;
            text-align: center;
            padding: 10px;
            border: 1px solid #ddd;
            background-color: #f8f9fa;
        }
        
        .summary-label {
            font-size: 10px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #2e7d32;
        }
        
        .teachers-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        
        .teachers-table th, .teachers-table td { 
            padding: 8px; 
            border: 1px solid #ddd; 
            text-align: center; 
            font-size: 10px;
        }
        
        .teachers-table th {
            background-color: #e8f5e8;
            font-weight: bold;
        }
        
        .teachers-table .teacher-name {
            text-align: left;
            font-weight: bold;
        }
        
        .currency { 
            text-align: right; 
        }
        
        .total-row {
            background-color: #f0f8f0;
            font-weight: bold;
        }
        
        .no-data {
            text-align: center;
            padding: 30px;
            color: #666;
            font-style: italic;
        }
        
        .footer {
            position: fixed;
            bottom: 15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Báo cáo lương theo khoa</h1>
        <div class="subtitle">Khoa {{ $department['name'] }} ({{ $department['abbrName'] }}) - Năm học {{ $academicYear['name'] }}</div>
        <p style="font-size: 10px; color: #888;">Ngày xuất: {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>

    <!-- Summary Stats -->
    <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px; color: #333;">TỔNG HỢP KHOA</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Tổng giảng viên</div>
                <div class="summary-value">{{ $departmentTotals['totalTeachers'] }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Tổng lớp học</div>
                <div class="summary-value">{{ $departmentTotals['totalClasses'] }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Tổng tiết QĐ</div>
                <div class="summary-value">{{ number_format($departmentTotals['totalLessons'], 1) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Tổng lương</div>
                <div class="summary-value">{{ number_format($departmentTotals['totalSalary'], 0, ',', '.') }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">TB/GV</div>
                <div class="summary-value">{{ number_format($departmentTotals['averageSalaryPerTeacher'], 0, ',', '.') }}</div>
            </div>
        </div>
    </div>

    <!-- Teachers Table -->
    @if(count($teachersData) > 0)
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px; color: #333;">CHI TIẾT GIẢNG VIÊN</h3>
            <table class="teachers-table">
                <thead>
                    <tr>
                        <th style="width: 5%;">STT</th>
                        <th style="width: 25%;">Giảng viên</th>
                        <th style="width: 15%;">Bằng cấp</th>
                        <th style="width: 10%;">Lớp học</th>
                        <th style="width: 10%;">Tiết QĐ</th>
                        <th style="width: 20%;">Tổng lương (VNĐ)</th>
                        <th style="width: 15%;">TB/lớp (VNĐ)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($teachersData as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td class="teacher-name">{{ $item['teacher']['fullName'] }}</td>
                            <td>{{ $item['teacher']['degree']['name'] }}</td>
                            <td>{{ $item['totalClasses'] }}</td>
                            <td>{{ number_format($item['totalLessons'], 1) }}</td>
                            <td class="currency">{{ number_format($item['totalSalary'], 0, ',', '.') }}</td>
                            <td class="currency">{{ number_format($item['totalSalary'] / $item['totalClasses'], 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3"><strong>TỔNG CỘNG</strong></td>
                        <td><strong>{{ $departmentTotals['totalClasses'] }}</strong></td>
                        <td><strong>{{ number_format($departmentTotals['totalLessons'], 1) }}</strong></td>
                        <td class="currency"><strong>{{ number_format($departmentTotals['totalSalary'], 0, ',', '.') }}</strong></td>
                        <td class="currency"><strong>{{ number_format($departmentTotals['averageSalaryPerTeacher'], 0, ',', '.') }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Top 5 Teachers Detail (if more than 5) -->
        @if(count($teachersData) > 5)
            <div class="page-break">
                <h3 style="margin-bottom: 15px; color: #333;">TOP 5 GIẢNG VIÊN LƯƠNG CAO NHẤT</h3>
                @foreach(array_slice($teachersData, 0, 5) as $index => $item)
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
                        <div style="font-weight: bold; margin-bottom: 5px;">
                            #{{ $index + 1 }} - {{ $item['teacher']['fullName'] }}
                        </div>
                        <div style="font-size: 10px; color: #666;">
                            Bằng cấp: {{ $item['teacher']['degree']['name'] }} | 
                            Lớp học: {{ $item['totalClasses'] }} | 
                            Tiết QĐ: {{ number_format($item['totalLessons'], 1) }} | 
                            Tổng lương: {{ number_format($item['totalSalary'], 0, ',', '.') }} VNĐ
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    @else
        <div class="no-data">
            <h3>Chưa có dữ liệu lương</h3>
            <p>Khoa {{ $department['name'] }} chưa có giảng viên nào được tính lương trong năm học {{ $academicYear['name'] }}.</p>
        </div>
    @endif

    <div class="footer">
        <p>Hệ thống quản lý giảng viên - Báo cáo khoa được tạo tự động</p>
    </div>
</body>
</html>