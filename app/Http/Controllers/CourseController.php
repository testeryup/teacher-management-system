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
        return Inertia::render('Courses', ['courses' => $courses]);
    }

    public function store(Request $request){
        try {
            // Log the request data to help debug
            \Log::info('Course store request:', $request->all());
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'credits' => 'required|integer|min:1',
                'lessons' => 'required|integer|min:1',
                'course_coefficient' => 'nullable|numeric|between:1.0,1.5',
            ]);

            \Log::info('Validated data:', $validated);
            
            $course = Course::create($validated);
            
            \Log::info('Course created:', $course->toArray());
            
            return redirect()->route('courses.index')
                ->with('message', 'Course created successfully');
        } catch (\Exception $e) {
            \Log::error('Error creating course: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Failed to create course: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Course $course){
        try {
            if($course->classrooms()->count() > 0){
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
                'lessons' => 'required|integer|min:1',
                'code' => 'nullable|string'
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