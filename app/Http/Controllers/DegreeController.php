<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Degree;

class DegreeController extends Controller
{
    public function index(){
        $degrees = Degree::all();
        return Inertia::render('Degrees/Index', ['degrees' => $degrees]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:degrees,name',
            'baseSalaryFactor' => 'required|numeric|min:0|unique:degrees,baseSalaryFactor',
        ]);

        
        Degree::create($validated);
        
        return redirect()->route('degrees.index')
            ->with('message', 'Bằng cấp đã được thêm thành công');
    }

    public function destroy(Degree $degree)
    {
        // Check if any teachers are using this degree
        if ($degree->teachers()->count() > 0) {
            return back()->withErrors(['reference' => 'Không thể xoá bằng cấp này vì đang được sử dụng bởi ' . 
                    $degree->teachers()->count() . ' giáo viên']);
        }

        $degree->delete();
        return redirect()->route('degrees.index')
            ->with('success', 'Xoá bằng cấp thành công');
    }

    public function update(Request $request, Degree $degree){
        $request->validate([
        'name' => 'required|string|max:255|unique:degrees,name,' . $degree->id,
        'baseSalaryFactor' => 'required|numeric|min:0|unique:degrees,baseSalaryFactor,' . $degree->id,
    ]);


        $degree->update([
            'name' => $request->input('name'),
            'baseSalaryFactor' => $request->input('baseSalaryFactor'),
        ]);
        return redirect()->route('degrees.index')->with('message', 'Chỉnh sửa bằng cấp thành công');
    }
}
