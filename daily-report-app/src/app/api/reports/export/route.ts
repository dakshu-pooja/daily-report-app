import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employee = searchParams.get('employee')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: any = {}
    if (employee) where.user = { name: { contains: employee } }
    if (from && to) {
        where.date = { gte: from, lte: to }
    } else if (from) {
        where.date = { gte: from }
    } else if (to) {
        where.date = { lte: to }
    }

    try {
        const reports = await prisma.report.findMany({
            where,
            include: {
                user: { select: { name: true, employeeId: true } },
            },
            orderBy: [{ date: 'desc' }, { user: { name: 'asc' } }],
        })

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Daily Report System'
        workbook.created = new Date()

        const sheet = workbook.addWorksheet('Employee Reports', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        })

        // Define columns
        sheet.columns = [
            { header: 'Employee Name', key: 'name', width: 20 },
            { header: 'Employee ID', key: 'employeeId', width: 12 },
            { header: 'Date', key: 'date', width: 14 },
            { header: 'Morning Report', key: 'morning', width: 45 },
            { header: 'Afternoon Report', key: 'afternoon', width: 45 },
            { header: 'Daily Summary', key: 'summary', width: 45 },
            { header: 'Remarks', key: 'remarks', width: 25 },
            { header: 'Submission Time', key: 'submittedAt', width: 20 },
        ]

        // Style header row
        const headerRow = sheet.getRow(1)
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E3A5F' },
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF2D5A8E' } },
                left: { style: 'thin', color: { argb: 'FF2D5A8E' } },
                bottom: { style: 'thin', color: { argb: 'FF2D5A8E' } },
                right: { style: 'thin', color: { argb: 'FF2D5A8E' } },
            }
        })
        headerRow.height = 30

        // Add data rows
        reports.forEach((report, index) => {
            const row = sheet.addRow({
                name: report.user.name,
                employeeId: report.user.employeeId,
                date: report.date,
                morning: report.morningReport || '-',
                afternoon: report.afternoonReport || '-',
                summary: report.dailySummary || '-',
                remarks: report.remarks || '-',
                submittedAt: new Date(report.submittedAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            })

            // Alternate row colors
            const bgColor = index % 2 === 0 ? 'FFFAFAFA' : 'FFEFF4FF'
            row.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor },
                }
                cell.alignment = { vertical: 'top', wrapText: true }
                cell.border = {
                    top: { style: 'hair', color: { argb: 'FFDDDDDD' } },
                    left: { style: 'hair', color: { argb: 'FFDDDDDD' } },
                    bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
                    right: { style: 'hair', color: { argb: 'FFDDDDDD' } },
                }
            })
            row.height = 60
        })

        // Freeze header row
        sheet.views = [{ state: 'frozen', ySplit: 1 }]

        // Add auto filter
        sheet.autoFilter = {
            from: 'A1',
            to: { row: 1, column: 8 },
        }

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        const filename = `employee-reports-${new Date().toISOString().split('T')[0]}.xlsx`

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }
}
