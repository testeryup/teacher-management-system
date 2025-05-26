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
            'baseSalaryFactor' => 'required|numeric|min:1.0|max:2.0',
        ], [
            'name.required' => 'Tên bằng cấp là bắt buộc',
            'name.unique' => 'Tên bằng cấp đã tồn tại trong hệ thống',
            'name.max' => 'Tên bằng cấp không được vượt quá 255 ký tự',
            'baseSalaryFactor.min' => 'Hệ số lương phải tối thiểu là 1.0',
            'baseSalaryFactor.max' => 'Hệ số lương phải tối đa là 2.0',
            'baseSalaryFactor.required' => 'Hệ số lương là bắt buộc',
            'baseSalaryFactor.numeric' => 'Hệ số lương phải là số',
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
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:degrees,name,' . $degree->id,
            'baseSalaryFactor' => 'required|numeric|min:1.0|max:2.0',
        ], [
            'name.required' => 'Tên bằng cấp là bắt buộc',
            'name.unique' => 'Tên bằng cấp đã tồn tại trong hệ thống',
            'name.max' => 'Tên bằng cấp không được vượt quá 255 ký tự',
            'baseSalaryFactor.min' => 'Hệ số lương phải tối thiểu là 1.0',
            'baseSalaryFactor.max' => 'Hệ số lương phải tối đa là 2.0',
            'baseSalaryFactor.required' => 'Hệ số lương là bắt buộc',
            'baseSalaryFactor.numeric' => 'Hệ số lương phải là số',
        ]);

        $degree->update($validated);
        return redirect()->route('degrees.index')->with('message', 'Chỉnh sửa bằng cấp thành công');
    }
}
