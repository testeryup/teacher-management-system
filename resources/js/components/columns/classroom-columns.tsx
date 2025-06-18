"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Classroom {
  id: number
  name: string
  code: string
  students: number
  course: {
    id: number
    name: string
    code: string
    department?: {
      id: number
      name: string
      abbrName: string
    }
  }
  semester: {
    id: number
    name: string
    academic_year: {
      id: number
      name: string
    }
  }
  teacher: {
    id: number
    fullName: string
    department?: {
      id: number
      name: string
      abbrName: string
    }
  } | null
}

interface ClassroomColumnsProps {
  onEdit: (classroom: Classroom) => void;
  onDelete: (id: number, name: string) => void;
}

export const createClassroomColumns = ({ onEdit, onDelete }: ClassroomColumnsProps): ColumnDef<Classroom>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mã lớp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-left px-3 font-medium">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên lớp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-left px-3">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "course",
    header: "Khóa học",
    cell: ({ row }) => {
      const course = row.getValue("course") as Classroom["course"]
      return (
        <div className="text-left">
          <div className="font-medium">{course?.name || ''}</div>
          <div className="text-sm text-muted-foreground">
            {course?.code}
            {course?.department && ` - ${course.department.abbrName}`}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "semester",
    header: "Học kỳ",
    cell: ({ row }) => {
      const semester = row.getValue("semester") as Classroom["semester"]
      return (
        <div className="text-left">
          <div>{semester?.name || ''}</div>
          <div className="text-sm text-muted-foreground">{semester?.academic_year?.name || ''}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "teacher",
    header: "Giáo viên",
    cell: ({ row }) => {
      const teacher = row.getValue("teacher") as Classroom["teacher"]
      return (
        <div className="text-left">
          <div>{teacher?.fullName || 'Chưa phân công'}</div>
          {teacher?.department && (
            <div className="text-sm text-muted-foreground">{teacher.department.abbrName}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "students",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Số học sinh
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("students") as number
      return <div className="text-left px-3 font-medium">{count}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Hành động</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const classroom = row.original
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(classroom.code)}
              >
                Copy mã lớp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(classroom)}
                className="cursor-pointer"
              >
                Sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(classroom.id, classroom.name)}
                className="cursor-pointer text-red-600"
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]