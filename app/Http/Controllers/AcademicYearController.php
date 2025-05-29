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
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
                'semesterCount' => 'required|integer|min:1|max:4',
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

    public function destroy(AcademicYear $academicyear){
        try {
            // Check for related records before deleting
            if($academicyear->semesters()->count() > 0){
                // Delete all related semesters first
                $academicyear->semesters()->delete();
            }
            
            $academicyear->delete();
            return redirect()->route('academicyears.index')
                ->with('message', 'Năm học đã được xóa thành công');
        } catch (\Exception $e) {
            return redirect()->route('academicyears.index')
                ->with('error', 'Không thể xóa năm học: ' . $e->getMessage());
        }
    }

    public function update(Request $request, AcademicYear $academicyear){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:academic_years,name,' . $academicyear->id,
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
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