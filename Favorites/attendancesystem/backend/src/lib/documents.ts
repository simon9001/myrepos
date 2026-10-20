import PDFDocument from 'pdfkit';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { downloadTemplate } from './storage';
import { AppError } from './errors';
import type { AttendanceRecord, Meeting, TrainingEvent, TrainingSession } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeetingDocContext {
  meeting: Meeting;
  orgName: string;
  orgLogoUrl?: string;
  records: AttendanceRecord[];
}

interface TrainingDocContext {
  event: TrainingEvent;
  sessions: (TrainingSession & { records: AttendanceRecord[] })[];
  orgName: string;
  orgLogoUrl?: string;
}

// ─── PDF generation (programmatic — no template required) ────────────────────

export async function generateMeetingPdf(ctx: MeetingDocContext): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(ctx.orgName, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('ATTENDANCE REGISTER', { align: 'center' });
    doc.moveDown(0.5);

    // Meeting details
    doc.fontSize(11).font('Helvetica-Bold').text('Meeting: ', { continued: true })
      .font('Helvetica').text(ctx.meeting.title);
    doc.font('Helvetica-Bold').text('Date: ', { continued: true })
      .font('Helvetica').text(ctx.meeting.scheduled_date);
    doc.font('Helvetica-Bold').text('Time: ', { continued: true })
      .font('Helvetica').text(ctx.meeting.start_time);
    if (ctx.meeting.location) {
      doc.font('Helvetica-Bold').text('Location: ', { continued: true })
        .font('Helvetica').text(ctx.meeting.location);
    }
    doc.font('Helvetica-Bold').text('Total Signed: ', { continued: true })
      .font('Helvetica').text(String(ctx.records.length));
    doc.moveDown(1);

    // Table header
    const colWidths = [30, 160, 120, 120, 80];
    const colX = [50, 80, 240, 360, 480];
    const rowH = 22;
    let y = doc.y;

    doc.rect(50, y, pageWidth, rowH).fill('#1E3A5F');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
    ['#', 'Full Name', 'Designation', 'Department', 'Time Signed'].forEach((h, i) => {
      doc.text(h, colX[i] + 2, y + 6, { width: colWidths[i] });
    });
    y += rowH;

    // Table rows
    doc.fillColor('#000000').font('Helvetica').fontSize(9);
    ctx.records.forEach((rec, idx) => {
      // Alternate row shading
      if (idx % 2 === 0) doc.rect(50, y, pageWidth, rowH).fill('#F5F5F5');
      doc.fillColor('#000000');

      const row = [
        String(idx + 1),
        rec.full_name,
        rec.designation ?? '',
        rec.department_name ?? '',
        new Date(rec.signed_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      ];
      row.forEach((cell, i) => {
        doc.text(cell, colX[i] + 2, y + 6, { width: colWidths[i], ellipsis: true });
      });

      // Row border
      doc.rect(50, y, pageWidth, rowH).stroke('#CCCCCC');
      y += rowH;

      // Page break if needed
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleString('en-KE')}`, { align: 'right' });

    doc.end();
  });
}

export async function generateTrainingPdf(ctx: TrainingDocContext): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50, size: 'A3', layout: 'landscape' });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text(ctx.orgName, { align: 'center' });
    doc.fontSize(13).font('Helvetica').text('TRAINING ATTENDANCE REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).text(ctx.event.title, { align: 'center' });
    doc.fontSize(9).fillColor('#666666')
      .text(`${ctx.event.start_date} — ${ctx.event.end_date}  |  ${ctx.event.venue ?? ''}`, { align: 'center' });
    doc.fillColor('#000000').moveDown(1);

    // Collect unique participants across all sessions
    const participantMap = new Map<string, AttendanceRecord>();
    for (const session of ctx.sessions) {
      for (const rec of session.records) {
        const key = (rec.email ?? rec.phone ?? rec.full_name).toLowerCase();
        if (!participantMap.has(key)) participantMap.set(key, rec);
      }
    }
    const participants = Array.from(participantMap.values());

    // Build session columns
    const fixedCols = 140; // name column
    const sessionColW = 60;
    const sessionNames = ctx.sessions.map((s) => s.title);

    let y = doc.y;
    const pageWidth = doc.page.width - 100;

    // Header row
    doc.rect(50, y, pageWidth, 24).fill('#1E3A5F');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
    doc.text('Participant', 52, y + 7, { width: fixedCols });
    sessionNames.forEach((name, i) => {
      doc.text(name, 52 + fixedCols + i * sessionColW, y + 7, {
        width: sessionColW,
        ellipsis: true,
      });
    });
    y += 24;

    doc.fillColor('#000000').font('Helvetica').fontSize(8);

    participants.forEach((p, idx) => {
      if (idx % 2 === 0) doc.rect(50, y, pageWidth, 20).fill('#F5F5F5');
      doc.fillColor('#000000');

      doc.text(`${p.full_name}${p.designation ? ' · ' + p.designation : ''}`,
        52, y + 5, { width: fixedCols, ellipsis: true });

      const pKey = (p.email ?? p.phone ?? p.full_name).toLowerCase();
      ctx.sessions.forEach((session, i) => {
        const signed = session.records.some((r) => {
          const k = (r.email ?? r.phone ?? r.full_name).toLowerCase();
          return k === pKey;
        });
        doc.text(signed ? '✓' : '–', 52 + fixedCols + i * sessionColW, y + 5, {
          width: sessionColW,
          align: 'center',
        });
      });

      doc.rect(50, y, pageWidth, 20).stroke('#DDDDDD');
      y += 20;

      if (y > doc.page.height - 80) {
        doc.addPage({ layout: 'landscape' });
        y = 50;
      }
    });

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#888888')
      .text(`Generated on ${new Date().toLocaleString('en-KE')}`, { align: 'right' });

    doc.end();
  });
}

// ─── Word (docx) generation — fills an uploaded template ─────────────────────

export async function generateMeetingDocx(
  ctx: MeetingDocContext,
  templateFileUrl: string,
): Promise<Buffer> {
  const templateBuffer = await downloadTemplate(templateFileUrl);

  const zip = new PizZip(templateBuffer);
  const templater = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const dateStr = new Date(ctx.meeting.scheduled_date).toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  templater.render({
    company_name: ctx.orgName,
    meeting_title: ctx.meeting.title,
    meeting_date: dateStr,
    meeting_time: ctx.meeting.start_time,
    meeting_type: ctx.meeting.meeting_type,
    location: ctx.meeting.location ?? ctx.meeting.virtual_link ?? '',
    total_signed: ctx.records.length,
    expected_attendees: ctx.meeting.expected_attendees ?? 'N/A',
    // Loop variable for attendance table
    attendees: ctx.records.map((r, i) => ({
      number: i + 1,
      full_name: r.full_name,
      designation: r.designation ?? '',
      department: r.department_name ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      time_signed: new Date(r.signed_at).toLocaleTimeString('en-KE', {
        hour: '2-digit', minute: '2-digit',
      }),
    })),
    generated_date: new Date().toLocaleString('en-KE'),
  });

  return templater.getZip().generate({ type: 'nodebuffer' }) as Buffer;
}

export async function generateTrainingDocx(
  ctx: TrainingDocContext,
  templateFileUrl: string,
): Promise<Buffer> {
  if (!ctx.sessions.length) throw new AppError('No sessions to generate document for.', 400);

  const templateBuffer = await downloadTemplate(templateFileUrl);
  const zip = new PizZip(templateBuffer);
  const templater = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const participantMap = new Map<string, AttendanceRecord>();
  for (const session of ctx.sessions) {
    for (const rec of session.records) {
      const key = (rec.email ?? rec.phone ?? rec.full_name).toLowerCase();
      if (!participantMap.has(key)) participantMap.set(key, rec);
    }
  }

  templater.render({
    company_name: ctx.orgName,
    training_title: ctx.event.title,
    venue: ctx.event.venue ?? '',
    start_date: ctx.event.start_date,
    end_date: ctx.event.end_date,
    sessions: ctx.sessions.map((s) => ({
      session_title: s.title,
      session_date: s.session_date,
      session_type: s.session_type,
      total_signed: s.records.length,
    })),
    participants: Array.from(participantMap.values()).map((p, i) => ({
      number: i + 1,
      full_name: p.full_name,
      designation: p.designation ?? '',
      email: p.email ?? '',
    })),
    generated_date: new Date().toLocaleString('en-KE'),
  });

  return templater.getZip().generate({ type: 'nodebuffer' }) as Buffer;
}
