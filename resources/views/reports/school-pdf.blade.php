<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo toàn trường - {{ $academicYear['name'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'DejaVu Sans', sans-serif; 
            font-size: 10px; 
            line-height: 1.3;
            color: #333;
            padding: 20px;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 25px; 
            border-bottom: 3px solid #333; 
            padding-bottom: 15px; 
        }
        
        .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            color: #1a237e;
        }
        
        .header .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        
        .school-summary {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .school-item {
            display: table-cell;
            width: 16.66%;
            text-align: center;
            padding: 12px;
            border: 1px solid #ddd;
            background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
        }
        
        .school-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .school-value {
            font-size: 16px;
            font-weight: bold;
            color: #1565c0;
        }
        
        .departments-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        
        .departments-table th, .departments-table td { 
            padding: 6px; 
            border: 1px solid #ddd; 
            text-align: center; 
            font-size: 9px;
        }
        
        .departments-table th {
            background-color: #1565c0;
            color: white;
            font-weight: bold;
        }
        
        .departments-table .dept-name {
            text-align: left;
            font-weight: bold;
        }
        
        .currency { 
            text-align: right; 
        }
        
        .total-row {
            background-color: #e8f5e8;
            font-weight: bold;
        }
        
        .top-teachers {
            margin-top: 20px;
        }
        
        .top-teacher-item {
            display: table;
            width: 100%;
            margin-bottom: 8px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        
        .teacher-rank {
            display: table-cell;
            width: 40px;
            text-align: center;
            vertical-align: middle;
            background-color: #ff9800;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        
        .teacher-info {
            display: table-cell;
            padding: 8px;
            vertical-align: middle;
        }
        
        .teacher-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
        }
        
        .teacher-details {
            font-size: 9px;
            color: #666;
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
            font-size: 8px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1565c0;
            margin: 20px 0 10px 0;
            padding: 5px 0;
            border-bottom: 2px solid #1565c0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Báo cáo lương toàn trường</h1>
        <div class="subtitle">Tổng hợp lương giảng viên - Năm học {{ $academicYear['name'] }}</div>
        <p style="font-size: 9px; color: #888;">Ngày xuất: {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>

    <!-- School Summary -->
    <div class="section-title">TỔNG HỢP TOÀN TRƯỜNG</div>
    <div class="school-summary">
        <div class="school-item">
            <div class="school-label">Tổng khoa</div>
            <div class="school-value">{{ $schoolTotals['totalDepartments'] }}</div>
        </div>
        <div class="school-item">
            <div class="school-label">Tổng GV</div>
            <div class="school-value">{{ $schoolTotals['totalTeachers'] }}</div>
        </div>
        <div class="school-item">
            <div class="school-label">Tổng lớp</div>
            <div class="school-value">{{ $schoolTotals['totalClasses'] }}</div>
        </div>
        <div class="school-item">
            <div class="school-label">Tổng tiết QĐ</div>
            <div class="school-value">{{ number_format($schoolTotals['totalLessons'], 0) }}</div>
        </div>
        <div class="school-item">
            <div class="school-label">Tổng lương</div>
            <div class="school-value">{{ number_format($schoolTotals['totalSalary'] / 1000000, 1) }}M</div>
        </div>
        <div class="school-item">
            <div class="school-label">TB/GV</div>
            <div class="school-value">{{ number_format($schoolTotals['averageSalaryPerTeacher'] / 1000000, 1) }}M</div>
        </div>
    </div>

    <!-- Departments Detail -->
    @if(count($departmentsData) > 0)
        <div class="section-title">CHI TIẾT THEO KHOA</div>
        <table class="departments-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Khoa</th>
                    <th style="width: 10%;">GV</th>
                    <th style="width: 10%;">Lớp</th>
                    <th style="width: 12%;">Tiết QĐ</th>
                    <th style="width: 18%;">Tổng lương (VNĐ)</th>
                    <th style="width: 15%;">TB/GV (VNĐ)</th>
                    <th style="width: 10%;">% Tổng</th>
                </tr>
            </thead>
            <tbody>
                @foreach($departmentsData as $dept)
                    <tr>
                        <td class="dept-name">
                            <div style="font-weight: bold;">{{ $dept['department']['name'] }}</div>
                            <div style="font-size: 8px; color: #666;">({{ $dept['department']['abbrName'] }})</div>
                        </td>
                        <td>{{ $dept['teachersCount'] }}</td>
                        <td>{{ $dept['totalClasses'] }}</td>
                        <td>{{ number_format($dept['totalLessons'], 1) }}</td>
                        <td class="currency">{{ number_format($dept['totalSalary'], 0, ',', '.') }}</td>
                        <td class="currency">{{ number_format($dept['totalSalary'] / $dept['teachersCount'], 0, ',', '.') }}</td>
                        <td>{{ number_format(($dept['totalSalary'] / $schoolTotals['totalSalary']) * 100, 1) }}%</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td><strong>TỔNG CỘNG</strong></td>
                    <td><strong>{{ $schoolTotals['totalTeachers'] }}</strong></td>
                    <td><strong>{{ $schoolTotals['totalClasses'] }}</strong></td>
                    <td><strong>{{ number_format($schoolTotals['totalLessons'], 1) }}</strong></td>
                    <td class="currency"><strong>{{ number_format($schoolTotals['totalSalary'], 0, ',', '.') }}</strong></td>
                    <td class="currency"><strong>{{ number_format($schoolTotals['averageSalaryPerTeacher'], 0, ',', '.') }}</strong></td>
                    <td><strong>100%</strong></td>
                </tr>
            </tbody>
        </table>

        <!-- Top Teachers Section -->
        @php
            $allTeachers = collect($departmentsData)->flatMap(function($dept) {
                return collect($dept['teachers'])->map(function($teacher) use ($dept) {
                    return [
                        'teacher' => $teacher['teacher'],
                        'department' => $dept['department']['abbrName'],
                        'totalSalary' => $teacher['totalSalary'],
                        'totalClasses' => $teacher['totalClasses'],
                        'totalLessons' => $teacher['totalLessons']
                    ];
                });
            })->sortByDesc('totalSalary')->take(10);
        @endphp

        @if($allTeachers->count() > 0)
            <div class="page-break">
                <div class="section-title">TOP 10 GIẢNG VIÊN LƯƠNG CAO NHẤT</div>
                <div class="top-teachers">
                    @foreach($allTeachers as $index => $teacher)
                        <div class="top-teacher-item">
                            <div class="teacher-rank">{{ $index + 1 }}</div>
                            <div class="teacher-info">
                                <div class="teacher-name">{{ $teacher['teacher']['fullName'] }}</div>
                                <div class="teacher-details">
                                    Khoa: {{ $teacher['department'] }} | 
                                    Lớp: {{ $teacher['totalClasses'] }} | 
                                    Tiết QĐ: {{ number_format($teacher['totalLessons'], 1) }} | 
                                    Lương: {{ number_format($teacher['totalSalary'], 0, ',', '.') }} VNĐ
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Department Breakdown -->
        <div class="page-break">
            <div class="section-title">PHÂN TÍCH THEO KHOA</div>
            @foreach($departmentsData as $dept)
                <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; color: #1565c0;">
                        {{ $dept['department']['name'] }} ({{ $dept['department']['abbrName'] }})
                    </div>
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; width: 20%; text-align: center; padding: 5px;">
                            <div style="font-size: 8px; color: #666;">Giảng viên</div>
                            <div style="font-weight: bold;">{{ $dept['teachersCount'] }}</div>
                        </div>
                        <div style="display: table-cell; width: 20%; text-align: center; padding: 5px;">
                            <div style="font-size: 8px; color: #666;">Lớp học</div>
                            <div style="font-weight: bold;">{{ $dept['totalClasses'] }}</div>
                        </div>
                        <div style="display: table-cell; width: 20%; text-align: center; padding: 5px;">
                            <div style="font-size: 8px; color: #666;">Tiết QĐ</div>
                            <div style="font-weight: bold;">{{ number_format($dept['totalLessons'], 1) }}</div>
                        </div>
                        <div style="display: table-cell; width: 20%; text-align: center; padding: 5px;">
                            <div style="font-size: 8px; color: #666;">Tổng lương</div>
                            <div style="font-weight: bold; color: #2e7d32;">{{ number_format($dept['totalSalary'], 0, ',', '.') }}</div>
                        </div>
                        <div style="display: table-cell; width: 20%; text-align: center; padding: 5px;">
                            <div style="font-size: 8px; color: #666;">% Tổng trường</div>
                            <div style="font-weight: bold; color: #d32f2f;">{{ number_format(($dept['totalSalary'] / $schoolTotals['totalSalary']) * 100, 1) }}%</div>
                        </div>
                    </div>
                    
                    @if(count($dept['teachers']) > 0)
                        <div style="margin-top: 8px; font-size: 9px; color: #666;">
                            <strong>Top GV:</strong> 
                            @foreach(array_slice($dept['teachers'], 0, 3) as $teacher)
                                {{ $teacher['teacher']['fullName'] }} ({{ number_format($teacher['totalSalary'], 0, ',', '.') }}){{ !$loop->last ? ', ' : '' }}
                            @endforeach
                        </div>
                    @endif
                </div>
            @endforeach
        </div>
        
    @else
        <div class="no-data">
            <h3>Chưa có dữ liệu lương</h3>
            <p>Chưa có khoa nào có dữ liệu lương trong năm học {{ $academicYear['name'] }}.</p>
        </div>
    @endif

    <div class="footer">
        <p>Hệ thống quản lý giảng viên - Báo cáo toàn trường được tạo tự động | Trang: <span class="pagenum"></span></p>
    </div>
</body>
</html>