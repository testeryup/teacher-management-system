<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\Semester;
use Inertia\Inertia;
use Exception;

class AcademicYearController extends Controller
{
    public function index(){
        $academicYears = AcademicYear::with('semesters')->paginate(10);
        return Inertia::render('AcademicYears', ['academicYears' => $academicYears]);
    }

    public function store(Request $request){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:academic_years,name',
                'startDate' => 'required|date|before:endDate',
                'endDate' => 'required|date|after:startDate',
                'semesterCount' => 'required|integer|min:1|max:4',
            ],[
                'name.required' => 'Tên năm học là bắt buộc',
                'name.unique' => 'Năm học này đã tồn tại',
                'name.max' => 'Tên năm học không được vượt quá 255 ký tự',
                'startDate.required' => 'Ngày bắt đầu là bắt buộc',
                'startDate.before' => 'Ngày bắt đầu phải trước ngày kết thúc',
                'endDate.required' => 'Ngày kết thúc là bắt buộc',
                'endDate.after' => 'Ngày kết thúc phải sau ngày bắt đầu',
            ]);
            
            $academicYear = AcademicYear::create([
                'name' => $validated['name'],
                'startDate' => $validated['startDate'],
                'endDate' => $validated['endDate'],
            ]);

            // Create semesters automatically
            $this->createSemesters($academicYear, $validated['semesterCount']);
            
            return redirect()->route('academicyears.index')
                ->with('message', 'Năm học đã được tạo thành công với ' . $validated['semesterCount'] . ' học kỳ');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể tạo năm học: ' . $e->getMessage())
                ->withInput();
        }
    }

    private function createSemesters(AcademicYear $academicYear, int $count)
    {
        $startDate = new \DateTime($academicYear->startDate);
        $endDate = new \DateTime($academicYear->endDate);
        $totalDays = $startDate->diff($endDate)->days;
        $daysPerSemester = intval($totalDays / $count);

        for ($i = 1; $i <= $count; $i++) {
            $semesterStart = clone $startDate;
            $semesterEnd = clone $startDate;
            $semesterEnd->add(new \DateInterval('P' . $daysPerSemester . 'D'));

            // Adjust last semester to end exactly on academic year end date
            if ($i === $count) {
                $semesterEnd = $endDate;
            }

            Semester::create([
                'name' => 'Học kỳ ' . $i,
                'startDate' => $semesterStart->format('Y-m-d'),
                'endDate' => $semesterEnd->format('Y-m-d'),
                'academicYear_id' => $academicYear->id,
            ]);

            // Move start date for next semester
            $startDate = clone $semesterEnd;
            $startDate->add(new \DateInterval('P1D'));
        }
    }

    public function destroy(AcademicYear $academicyear)
    {
        try {
            $user = auth()->user();
            
            if (!$user->isAdmin()) {
                abort(403, 'Chỉ Admin mới có quyền xóa năm học');
            }

            // FIX: Check for salary configs - CRITICAL CHECK
            $hasSalaryConfigs = \App\Models\SalaryConfig::whereIn('semester_id', 
                $academicyear->semesters()->pluck('id')
            )->exists();
            
            if ($hasSalaryConfigs) {
                return back()->withErrors([
                    'reference' => 'KHÔNG THỂ XÓA: Năm học này có cấu hình lương. Xóa sẽ làm mất dữ liệu lương đã tính toán!'
                ]);
            }

            // Check for classrooms
            $hasClassrooms = \App\Models\Classroom::whereIn('semester_id', 
                $academicyear->semesters()->pluck('id')
            )->exists();
            
            if ($hasClassrooms) {
                return back()->withErrors([
                    'reference' => 'Không thể xóa năm học này vì có lớp học trong các học kỳ'
                ]);
            }

            // Check for semesters
            if ($academicyear->semesters()->count() > 0) {
                return back()->withErrors([
                    'reference' => 'Không thể xóa năm học này vì đang có học kỳ'
                ]);
            }

            // Safe to delete
            $academicyear->delete();
            
            return redirect()->route('academicyears.index')
                ->with('message', 'Xóa năm học thành công');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể xóa năm học: ' . $e->getMessage());
        }
    }

    public function update(Request $request, AcademicYear $academicyear){
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('academic_years', 'name')->ignore($academicYear->id), 
                ],
                'startDate' => [
                    'required',
                    'date',
                    'before:endDate'
                ],
                'endDate' => [
                    'required',
                    'date',
                    'after:startDate'
                ],
            ], [
                'name.required' => 'Tên năm học là bắt buộc',
                'name.unique' => 'Năm học này đã tồn tại',
                'startDate.before' => 'Ngày bắt đầu phải trước ngày kết thúc',
                'endDate.after' => 'Ngày kết thúc phải sau ngày bắt đầu',
            ]);
            
            $academicyear->update($validated);
            
            return redirect()->route('academicyears.index')
                ->with('message', 'Năm học đã được cập nhật thành công');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Không thể cập nhật năm học: ' . $e->getMessage())
                ->withInput();
        }
    }

}