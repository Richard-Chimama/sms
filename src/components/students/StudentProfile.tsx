'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StudentWithRelations } from "@/types";
import { formatDate } from "@/lib/utils";

interface StudentProfileProps {
  student: StudentWithRelations;
}

export default function StudentProfile({ student }: StudentProfileProps) {
  // Calculate statistics
  const totalExams = student.examResults.length;
  const totalMarks = student.examResults.reduce((sum, result) => sum + result.marks, 0);
  const totalPossibleMarks = student.examResults.reduce((sum, result) => sum + result.totalMarks, 0);
  const averagePercentage = totalPossibleMarks > 0 ? (totalMarks / totalPossibleMarks) * 100 : 0;

  const totalAttendance = student.attendances.length;
  const presentDays = student.attendances.filter(a => a.status === "PRESENT").length;
  const lateDays = student.attendances.filter(a => a.status === "LATE").length;
  const absentDays = student.attendances.filter(a => a.status === "ABSENT").length;
  const attendancePercentage = totalAttendance > 0 ? ((presentDays + lateDays) / totalAttendance) * 100 : 0;

  const pendingAssignments = student.assignments.filter(a => 
    !a.submissions.some(s => s.studentId === student.id && s.status === "GRADED")
  ).length;

  // Calculate fee statistics
  const totalFees = student.feePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidFees = student.feePayments
    .filter(payment => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingFees = totalFees - paidFees;
  const paymentStatus = pendingFees > 0 ? "PENDING" : "PAID";

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">{student.user.firstName} {student.user.lastName}</h1>
        <p className="text-gray-500">Class {student.class.grade}-{student.class.section} | Roll Number: {student.rollNumber}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-700">Academic Performance</h3>
            <p className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">{totalExams} Exams</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-700">Attendance Rate</h3>
            <p className="text-2xl font-bold">{attendancePercentage.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">{totalAttendance} Days</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-700">Pending Assignments</h3>
            <p className="text-2xl font-bold">{pendingAssignments}</p>
            <p className="text-sm text-gray-600">Total: {student.assignments.length}</p>
          </CardContent>
        </Card>
        <Card className={paymentStatus === "PAID" ? "bg-green-50" : "bg-red-50"}>
          <CardContent className="p-4">
            <h3 className={`font-semibold ${paymentStatus === "PAID" ? "text-green-700" : "text-red-700"}`}>Fee Status</h3>
            <p className="text-2xl font-bold">{((paidFees / totalFees) * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Paid: ${paidFees.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd>{student.user.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Roll Number</dt>
                <dd>{student.rollNumber}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Class Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Class Information</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-500">Grade & Section</dt>
                <dd>{student.class.grade}-{student.class.section}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Class Teacher</dt>
                <dd>{student.class.teacher.user.firstName} {student.class.teacher.user.lastName}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Parent Information</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-500">Name</dt>
                <dd>{student.parent.user.firstName} {student.parent.user.lastName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd>{student.parent.user.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Attendance Overview</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-700 font-semibold">Present</p>
              <p className="text-2xl font-bold">{presentDays}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700 font-semibold">Late</p>
              <p className="text-2xl font-bold">{lateDays}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 font-semibold">Absent</p>
              <p className="text-2xl font-bold">{absentDays}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.attendances.map((attendance) => (
                  <tr key={attendance.id} className="border-b">
                    <td className="py-2">{formatDate(attendance.date)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        attendance.status === "PRESENT" ? "bg-green-100 text-green-800" :
                        attendance.status === "LATE" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {attendance.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Academic Performance</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Marks</th>
                  <th className="text-left py-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {student.examResults.map((result) => {
                  const percentage = (result.marks / result.totalMarks) * 100;
                  return (
                    <tr key={result.id} className="border-b">
                      <td className="py-2">{result.subject.name}</td>
                      <td className="py-2">{formatDate(result.date)}</td>
                      <td className="py-2">{result.marks}/{result.totalMarks}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          percentage >= 75 ? "bg-green-100 text-green-800" :
                          percentage >= 50 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Assignments</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.assignments.map((assignment) => {
                  const submission = assignment.submissions.find(s => s.studentId === student.id);
                  const status = submission ? submission.status : "PENDING";
                  return (
                    <tr key={assignment.id} className="border-b">
                      <td className="py-2">{assignment.title}</td>
                      <td className="py-2">{assignment.subject.name}</td>
                      <td className="py-2">{formatDate(assignment.dueDate)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          status === "GRADED" ? "bg-green-100 text-green-800" :
                          status === "SUBMITTED" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fee Payments */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Fee Payments</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700 font-semibold">Total Fees</p>
              <p className="text-2xl font-bold">${totalFees.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-700 font-semibold">Paid Fees</p>
              <p className="text-2xl font-bold">${paidFees.toFixed(2)}</p>
            </div>
            <div className={`${pendingFees > 0 ? "bg-red-50" : "bg-green-50"} p-4 rounded-lg`}>
              <p className={`${pendingFees > 0 ? "text-red-700" : "text-green-700"} font-semibold`}>
                {pendingFees > 0 ? "Pending Fees" : "All Paid"}
              </p>
              <p className="text-2xl font-bold">${pendingFees.toFixed(2)}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Paid Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.feePayments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-2">{payment.description}</td>
                    <td className="py-2">${payment.amount.toFixed(2)}</td>
                    <td className="py-2">{formatDate(payment.dueDate)}</td>
                    <td className="py-2">{payment.paidDate ? formatDate(payment.paidDate) : "-"}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        payment.status === "PAID" ? "bg-green-100 text-green-800" :
                        payment.status === "OVERDUE" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 