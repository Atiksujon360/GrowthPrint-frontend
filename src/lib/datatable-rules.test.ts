import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  compareValues, 
  sortRows, 
  paginateRows, 
  filterRows 
} from './datatable-rules.ts';

interface SampleItem {
  id: string;
  name: string;
  amount: number;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
  createdAt: string;
}

const SAMPLE_DATA: SampleItem[] = [
  { id: '1', name: 'Zeta Protocol', amount: 5000, status: 'ACTIVE', createdAt: '2026-01-15' },
  { id: '2', name: 'Alpha Logistics', amount: 12000, status: 'PENDING', createdAt: '2026-03-20' },
  { id: '3', name: 'Beta Systems', amount: 3500, status: 'CLOSED', createdAt: '2025-11-05' },
  { id: '4', name: 'Delta Health', amount: 8400, status: 'ACTIVE', createdAt: '2026-02-10' },
  { id: '5', name: 'Echo Freight', amount: 1500, status: 'PENDING', createdAt: '2026-04-01' }
];

test('compareValues handles numbers, strings, and dates accurately', () => {
  assert.ok(compareValues(10, 20) < 0);
  assert.ok(compareValues(20, 10) > 0);
  assert.equal(compareValues(15, 15), 0);

  // String alphabetical comparison
  assert.ok(compareValues('Alpha', 'Beta') < 0);
  assert.ok(compareValues('Zeta', 'Alpha') > 0);

  // Date comparison
  assert.ok(compareValues('2025-12-31', '2026-01-01') < 0);
  assert.ok(compareValues('2026-06-01', '2026-01-01') > 0);
});

test('sortRows sorts ascending and descending by numerical and string fields', () => {
  // Sort by amount asc
  const ascAmount = sortRows(SAMPLE_DATA, 'amount', 'asc');
  assert.equal(ascAmount[0].amount, 1500);
  assert.equal(ascAmount[4].amount, 12000);

  // Sort by amount desc
  const descAmount = sortRows(SAMPLE_DATA, 'amount', 'desc');
  assert.equal(descAmount[0].amount, 12000);
  assert.equal(descAmount[4].amount, 1500);

  // Sort by name asc
  const ascName = sortRows(SAMPLE_DATA, 'name', 'asc');
  assert.equal(ascName[0].name, 'Alpha Logistics');
  assert.equal(ascName[4].name, 'Zeta Protocol');
});

test('paginateRows accurately divides items and calculates page ranges', () => {
  // 5 items with pageSize 2 -> 3 pages (2, 2, 1)
  const page1 = paginateRows(SAMPLE_DATA, 1, 2);
  assert.equal(page1.paginatedRows.length, 2);
  assert.equal(page1.totalPages, 3);
  assert.equal(page1.startIndex, 1);
  assert.equal(page1.endIndex, 2);
  assert.equal(page1.hasNextPage, true);
  assert.equal(page1.hasPrevPage, false);

  const page2 = paginateRows(SAMPLE_DATA, 2, 2);
  assert.equal(page2.paginatedRows.length, 2);
  assert.equal(page2.startIndex, 3);
  assert.equal(page2.endIndex, 4);
  assert.equal(page2.hasNextPage, true);
  assert.equal(page2.hasPrevPage, true);

  const page3 = paginateRows(SAMPLE_DATA, 3, 2);
  assert.equal(page3.paginatedRows.length, 1);
  assert.equal(page3.startIndex, 5);
  assert.equal(page3.endIndex, 5);
  assert.equal(page3.hasNextPage, false);
  assert.equal(page3.hasPrevPage, true);

  // Empty data edge case
  const emptyRes = paginateRows([], 1, 10);
  assert.equal(emptyRes.paginatedRows.length, 0);
  assert.equal(emptyRes.totalRows, 0);
  assert.equal(emptyRes.startIndex, 0);
  assert.equal(emptyRes.endIndex, 0);
});

test('filterRows filters accurately by status and search query', () => {
  // Status filtering
  const activeOnly = filterRows(SAMPLE_DATA, {
    statusKey: 'status',
    selectedStatus: 'ACTIVE'
  });
  assert.equal(activeOnly.length, 2);
  assert.ok(activeOnly.every(i => i.status === 'ACTIVE'));

  // 'ALL' should return all items
  const allItems = filterRows(SAMPLE_DATA, {
    statusKey: 'status',
    selectedStatus: 'ALL'
  });
  assert.equal(allItems.length, 5);

  // Search query filtering
  const searchFreight = filterRows(SAMPLE_DATA, {
    searchQuery: 'freight',
    searchKeys: ['name']
  });
  assert.equal(searchFreight.length, 1);
  assert.equal(searchFreight[0].name, 'Echo Freight');

  // Multi-field search
  const combinedFilter = filterRows(SAMPLE_DATA, {
    statusKey: 'status',
    selectedStatus: 'PENDING',
    searchQuery: 'Alpha',
    searchKeys: ['name']
  });
  assert.equal(combinedFilter.length, 1);
  assert.equal(combinedFilter[0].id, '2');
});
