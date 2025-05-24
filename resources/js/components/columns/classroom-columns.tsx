"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Classroom = {
  id: number
  name: string
  code: string
  course: {
    id: number
    name: string
    code: string
  }
  teacher: {
    id: number
    fullName: string
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
  students: number
}

interface ClassroomColumnsProps {
  onEdit: (classroom: Classroom) => void
  onDelete: (id: number, name: string) => void
}

export const createClassroomColumns = ({ onEdit, onDelete }: ClassroomColumnsProps): ColumnDef<Classroom>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên lớp học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "code",
    header: "Mã lớp",
    cell: ({ row }) => <div className="font-mono">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "course",
    header: "Khóa học",
    cell: ({ row }) => {
      const course = row.getValue("course") as Classroom["course"]
      return <div>{course?.name || ''}</div>
    },
  },
  {
    accessorKey: "semester",
    header: "Học kỳ",
    cell: ({ row }) => {
      const semester = row.getValue("semester") as Classroom["semester"]
      return <div>{semester?.name || ''}</div>
    },
  },
  {
    id: "academicYear",
    header: "Năm học",
    cell: ({ row }) => {
      const semester = row.getValue("semester") as Classroom["semester"]
      return <div>{semester?.academic_year?.name || ''}</div>
    },
  },
  {
    accessorKey: "teacher",
    header: "Giáo viên",
    cell: ({ row }) => {
      const teacher = row.getValue("teacher") as Classroom["teacher"]
      return <div>{teacher?.fullName || ''}</div>
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
  header: () => <div className="text-center">Hành động</div>, // Center the header
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