import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getCarById } from '../db/repository/cars';
import { listComponentsByCar } from '../db/repository/components';
import { listInvoicePhotosByCar } from '../db/repository/invoicePhotos';
import { listLogEntriesByCar } from '../db/repository/logEntries';
import { listScheduleItemsByCar } from '../db/repository/scheduleItems';
import { loadSettings, type AppSettings } from '../db/repository/settings';
import type { Car, Component, InvoicePhoto, LogEntry, ServiceScheduleItem } from '../db/types';
import { readPhotoAsDataUriAsync } from './invoicePhotos';

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(symbol: string, amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}${escapeHtml(symbol)}${Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface ReportData {
  car: Car;
  components: Component[];
  scheduleItems: ServiceScheduleItem[];
  logEntries: LogEntry[];
  photosByEntry: Map<number, string[]>;
  settings: AppSettings;
}

async function loadReportData(db: SQLiteDatabase, carId: number): Promise<ReportData> {
  const car = await getCarById(db, carId);
  if (!car) throw new Error('Car not found');

  const [components, scheduleItems, logEntries, photos, settings] = await Promise.all([
    listComponentsByCar(db, carId),
    listScheduleItemsByCar(db, carId),
    listLogEntriesByCar(db, carId),
    listInvoicePhotosByCar(db, carId),
    loadSettings(db),
  ]);

  const photosByEntry = new Map<number, string[]>();
  for (const photo of photos as InvoicePhoto[]) {
    const dataUri = await readPhotoAsDataUriAsync(photo.uri);
    if (!dataUri) continue;
    photosByEntry.set(photo.log_entry_id, [...(photosByEntry.get(photo.log_entry_id) ?? []), dataUri]);
  }

  return { car, components, scheduleItems, logEntries, photosByEntry, settings };
}

function buildHtml(data: ReportData): string {
  const { car, components, scheduleItems, logEntries, photosByEntry, settings } = data;
  const money = (amount: number) => formatMoney(settings.currencySymbol, amount);

  const totalSpend = logEntries.reduce((sum, entry) => sum + (entry.cost ?? 0), 0);
  const profit = car.is_sold && car.sale_price != null ? car.sale_price - car.purchase_price - totalSpend : null;

  const detailRows: [string, string][] = [
    ['Registration', escapeHtml(car.registration)],
    ['Make / model', `${escapeHtml(car.make)} ${escapeHtml(car.model)}`],
    ['Year', escapeHtml(car.year)],
  ];
  if (car.colour) detailRows.push(['Colour', escapeHtml(car.colour)]);
  detailRows.push(['Status', car.is_sold ? 'Sold' : 'Active']);

  const financialRows: [string, string][] = [
    ['Purchase price', `${money(car.purchase_price)} <span class="muted">(${escapeHtml(car.purchase_date)})</span>`],
    ['Spend logged', money(totalSpend)],
  ];
  if (car.is_sold && car.sale_price != null) {
    financialRows.push([
      'Sale price',
      `${money(car.sale_price)} <span class="muted">(${escapeHtml(car.sale_date)})</span>`,
    ]);
    if (profit != null) {
      financialRows.push([profit >= 0 ? 'Profit' : 'Loss', `<strong>${money(profit)}</strong>`]);
    }
  } else {
    financialRows.push(['Total cost to date', `<strong>${money(car.purchase_price + totalSpend)}</strong>`]);
  }

  const keyValueTable = (rows: [string, string][]) =>
    `<table class="kv">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;

  const componentsHtml = components.length
    ? `<table><thead><tr><th>Component</th><th>Category</th><th>Installed</th><th>Mileage</th></tr></thead><tbody>${components
        .map(
          (c) =>
            `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.category)}</td><td>${escapeHtml(
              c.installed_date ?? '—'
            )}</td><td>${c.installed_mileage != null ? escapeHtml(c.installed_mileage.toLocaleString('en-GB')) : '—'}</td></tr>`
        )
        .join('')}</tbody></table>`
    : '<p class="muted">No components recorded.</p>';

  const scheduleHtml = scheduleItems.length
    ? `<table><thead><tr><th>Item</th><th>Last done</th><th>Next due</th></tr></thead><tbody>${scheduleItems
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.name)}${
              item.description ? `<div class="muted">${escapeHtml(item.description)}</div>` : ''
            }</td><td>${escapeHtml(item.last_done_date ?? '—')}</td><td>${escapeHtml(
              item.next_due_date ?? '—'
            )}</td></tr>`
        )
        .join('')}</tbody></table>`
    : '<p class="muted">No schedule items recorded.</p>';

  const logHtml = logEntries.length
    ? logEntries
        .map((entry) => {
          const photos = photosByEntry.get(entry.id) ?? [];
          const meta = [
            escapeHtml(entry.date),
            escapeHtml(entry.entry_type),
            entry.mileage_at_entry != null ? `${escapeHtml(entry.mileage_at_entry.toLocaleString('en-GB'))} mi` : null,
          ]
            .filter(Boolean)
            .join(' · ');
          return `<div class="entry">
            <div class="entry-head"><strong>${escapeHtml(entry.title)}</strong>${
              entry.cost != null ? `<span>${money(entry.cost)}</span>` : ''
            }</div>
            <div class="muted">${meta}</div>
            ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ''}
            ${
              photos.length
                ? `<div class="photos">${photos.map((src) => `<img src="${src}" />`).join('')}</div>`
                : ''
            }
          </div>`;
        })
        .join('')
    : '<p class="muted">No log entries recorded.</p>';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1c1c1e; padding: 24px; font-size: 13px; }
  h1 { font-size: 26px; margin: 0; }
  h2 { font-size: 16px; margin: 28px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #2f6fed; color: #2f6fed; }
  .muted { color: #6b6b72; font-size: 12px; }
  .banner { background: #2f6fed; color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 8px; }
  .banner .muted { color: #dbe6fd; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e8e8ec; vertical-align: top; }
  thead th { background: #f6f6f7; font-size: 12px; }
  table.kv th { width: 35%; color: #6b6b72; font-weight: 500; }
  .entry { border: 1px solid #e8e8ec; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; page-break-inside: avoid; }
  .entry-head { display: flex; justify-content: space-between; }
  .entry p { margin: 6px 0 0; }
  .photos { margin-top: 8px; }
  .photos img { max-width: 48%; max-height: 320px; margin: 0 1% 6px 0; border-radius: 6px; border: 1px solid #e8e8ec; }
  .footer { margin-top: 32px; text-align: center; }
</style>
</head>
<body>
  <div class="banner">
    <h1>${escapeHtml(car.name)}</h1>
    <div class="muted">${escapeHtml(car.year)} ${escapeHtml(car.make)} ${escapeHtml(car.model)} · ${escapeHtml(
    car.registration
  )}</div>
  </div>
  ${settings.ownerName ? `<div class="muted">Prepared for ${escapeHtml(settings.ownerName)}</div>` : ''}

  <h2>Vehicle details</h2>
  ${keyValueTable(detailRows)}

  <h2>Financial summary</h2>
  ${keyValueTable(financialRows)}

  <h2>Components</h2>
  ${componentsHtml}

  <h2>Service schedule</h2>
  ${scheduleHtml}

  <h2>Service &amp; cost history</h2>
  ${logHtml}

  <div class="footer muted">Generated by Under the Bonnet on ${escapeHtml(new Date().toLocaleDateString('en-GB'))}</div>
</body>
</html>`;
}

// Builds a PDF for the car and opens the system share sheet. Returns false if
// sharing isn't available on this device (the PDF is still generated).
export async function shareCarReportAsync(db: SQLiteDatabase, carId: number): Promise<boolean> {
  const data = await loadReportData(db, carId);
  const { uri } = await Print.printToFileAsync({ html: buildHtml(data) });

  const safeName = data.car.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'car';
  const named = new File(Paths.cache, `${safeName}-report.pdf`);
  if (named.exists) named.delete();
  new File(uri).copy(named);

  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(named.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: `${data.car.name} report`,
  });
  return true;
}
