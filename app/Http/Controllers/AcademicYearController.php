<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index(){
        $academicYears = AcademicYear::paginate(10);
        return Inertia::render('AcademicYear', ['academicYears' => $academicYears]);
    }

    public function store(Request $request){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
            ]);
            
            $academicYear = AcademicYear::create($validated);
            
            return redirect()->route('academicyears.index')
                ->with('message', 'Academic year created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create academic year: ' . $e->getMessage())
                ->withInput();
        }
    }   

    public function destroy(AcademicYear $academicyear){
        try {
            // Check for related records before deleting
            // For example: if ($academicyear->courses()->count() > 0) { ... }
            if($academicyear->semesters()->count() > 0){
                throw new Exception("dependent semester detected");
            }
            $academicyear->delete();
            return redirect()->route('academicyears.index')
                ->with('message', 'Academic year deleted successfully');
        } catch (\Exception $e) {
            return redirect()->route('academicyears.index')
                ->with('error', 'Failed to delete academic year: ' . $e->getMessage());
        }
    }

    public function update(Request $request, AcademicYear $academicyear){
        try {
            if($academicyear->semesters()->count() > 0){
                throw new Exception("dependent semester detected");
            }
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
            ]);
            
            $academicyear->update($validated);
            
            return redirect()->route('academicyears.index')
                ->with('message', 'Academic year updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update academic year: ' . $e->getMessage())
                ->withInput();
        }
    }
}
