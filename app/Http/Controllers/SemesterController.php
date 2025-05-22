<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Semester;
use Inertia\Inertia;
use Exception;

class SemesterController extends Controller
{
    public function index(){
        $semesters = Semester::paginate(10);
        return Inertia::render('Semester', ['semesters' => $semesters]);
    }

    public function store(Request $request){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
                'academicYear_id' => 'required|exists:academic_years,id'

            ]);

            $semester = Semester::create($validated);
            return redirect()->route('semesters.index')
                ->with('message', 'Semester created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create semester: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Semester $semester){
        try {
            if($semester->classrooms()->count() > 0){
                throw new Exception("Dependend classroom detected, cannot delete");
            }
            $semester->delete();
            return redirect()->route('semesters.index')
                ->with('message', 'Semester deleted successfully');
        } catch (\Throwable $th) {
            return redirect()->route('semesters.index')
                ->with('error', 'Failed to delete semester: ' . $th->getMessage());
        }
    }

    public function update(Request $request, Semester $semester)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'startDate' => 'required|date',
                'endDate' => 'required|date|after:startDate',
                'academicYear_id' => 'required|exists:academic_years,id'
            ]);
            
            $semester->update($validated);
            
            return redirect()->route('semesters.index')
                ->with('message', 'Semester updated successfully');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update semester: ' . $e->getMessage())
                ->withInput();
        }
    }
}
