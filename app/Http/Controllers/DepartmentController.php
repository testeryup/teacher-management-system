<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(){
        $departments = Department::all();
        return Inertia::render('Departments/Index', ['departments' => $departments]);
    }

    public function store(Request $request){
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'abbrName' => 'required|string|max:255|unique:departments,abbrName',
            'description' => 'string'
        ]);
        Department::create($request->all());
        return redirect()->route('departments.index')->with('message', 'Department created successfully');
    }

    public function destroy(Department $department){
        try {
            $department->delete();
            return redirect()->route('departments.index')->with('message', 'Deleted department successfully');
        } catch (\Exception $e) {
            error_log('Department deletion error: ' . $e->getMessage());
            return redirect()->route('departments.index')->with('message', 'Failed to delete department');
        }
    }
}
