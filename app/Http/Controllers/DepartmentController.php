<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Department;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::paginate(10);
        return Inertia::render('Departments/Index', ['departments' => $departments]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:departments,name' // FIX: Check duplicate name
                ],
                'abbrName' => [
                    'required',
                    'string',
                    'max:10',
                    'unique:departments,abbrName' // FIX: Check duplicate abbreviation
                ],
            ], [
                // FIX: Custom error messages in Vietnamese
                'name.required' => 'Tên khoa là bắt buộc',
                'name.unique' => 'Tên khoa này đã tồn tại',
                'name.max' => 'Tên khoa không được vượt quá 255 ký tự',
                'abbrName.required' => 'Tên viết tắt là bắt buộc',
                'abbrName.unique' => 'Tên viết tắt này đã tồn tại',
                'abbrName.max' => 'Tên viết tắt không được vượt quá 10 ký tự',
            ]);

            Department::create($validated);

            Log::info('Department created successfully', [
                'department_name' => $validated['name'],
                'user_id' => auth()->id()
            ]);

            return redirect()->route('departments.index')
                ->with('message', 'Khoa đã được thêm thành công');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Department creation validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            // Let Laravel handle validation errors automatically
            throw $e;

        } catch (\Exception $e) {
            Log::error('Department creation failed with exception', [
                'message' => $e->getMessage(),
                'input' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return redirect()->back()
                ->with('error', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.')
                ->withInput();
        }
    }

    public function update(Request $request, Department $department)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('departments', 'name')->ignore($department->id) // FIX: Ignore current record
                ],
                'abbrName' => [
                    'required',
                    'string',
                    'max:10',
                    Rule::unique('departments', 'abbrName')->ignore($department->id) // FIX: Ignore current record
                ],
            ], [
                'name.required' => 'Tên khoa là bắt buộc',
                'name.unique' => 'Tên khoa này đã tồn tại',
                'name.max' => 'Tên khoa không được vượt quá 255 ký tự',
                'abbrName.required' => 'Tên viết tắt là bắt buộc',
                'abbrName.unique' => 'Tên viết tắt này đã tồn tại',
                'abbrName.max' => 'Tên viết tắt không được vượt quá 10 ký tự',
            ]);

            $department->update($validated);

            Log::info('Department updated successfully', [
                'department_id' => $department->id,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('departments.index')
                ->with('message', 'Chỉnh sửa khoa thành công');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Department update validation failed', [
                'department_id' => $department->id,
                'errors' => $e->errors(),
                'user_id' => auth()->id()
            ]);

            throw $e;

        } catch (\Exception $e) {
            Log::error('Department update failed with exception', [
                'department_id' => $department->id,
                'message' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return redirect()->back()
                ->with('error', 'Không thể cập nhật khoa. Vui lòng thử lại.')
                ->withInput();
        }
    }

    public function destroy(Department $department)
    {
        try {
            // Check if any teachers are using this department
            if ($department->teachers()->count() > 0) {
                return back()->withErrors([
                    'reference' => 'Không thể xóa khoa này vì đang có ' . 
                        $department->teachers()->count() . ' giáo viên thuộc khoa này'
                ]);
            }

            // Check if any courses are using this department
            if ($department->courses()->count() > 0) {
                return back()->withErrors([
                    'reference' => 'Không thể xóa khoa này vì đang có ' . 
                        $department->courses()->count() . ' môn học thuộc khoa này'
                ]);
            }

            $departmentName = $department->name;
            $department->delete();

            Log::info('Department deleted successfully', [
                'department_name' => $departmentName,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('departments.index')
                ->with('message', 'Xóa khoa thành công');

        } catch (\Exception $e) {
            Log::error('Department deletion failed', [
                'department_id' => $department->id,
                'message' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return redirect()->back()
                ->with('error', 'Không thể xóa khoa: ' . $e->getMessage());
        }
    }
}
