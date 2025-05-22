<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use Inertia\Inertia;
use Exception;

class CourseController extends Controller
{
    public function index(){
        $courses = Course::paginate(10);
        return Inertia::render('Course', ['courses' => $courses]);
    }

    public function store(Request $request){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'credits' => 'required|integer|min:1',
                'lessions' => 'required|integer|min:1',
            ]);

            $course = Course::create($validated);
            return redirect()->route('courses.index')
                ->with('message', 'Course created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create Course: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course){
        try {
            if($course->classroom()->count() > 0){
                throw new Exception("Dependent classroom detected, cannot delete");
            }
            $course->delete();
            return redirect()->route('courses.index')
                ->with('message', 'Course deleted successfully');
        } catch (\Throwable $th) {
            return redirect()->route('courses.index')
                ->with('error', 'Failed to delete course: ' . $th->getMessage());
        }
    }

    public function update(Request $request, Course $course){
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'credits' => 'required|integer|min:1',
                'lessions' => 'required|integer|min:1',
            ]);
            $course->update($validated);
            return redirect()->route('courses.index')
                ->with('message', 'Course updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update course: ' . $e->getMessage())
                ->withInput();
        }
    }
}