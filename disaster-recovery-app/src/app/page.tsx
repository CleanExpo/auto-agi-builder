'use client';

import React, { useState } from 'react';
import { ChecklistItem } from '@/components';

interface ChecklistItemType {
  id: string;
  label: string;
  checked: boolean;
}

const Home: React.FC = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItemType[]>([
    { id: '1', label: 'Incident Verification', checked: false },
    { id: '2', label: 'Safety Assessment', checked: false },
    { id: '3', label: 'Power Availability Check', checked: false },
    { id: '4', label: 'PPE Requirements', checked: false },
    { id: '5', label: 'Occupant Status Review', checked: false },
  ]);

  const handleCheckItem = (id: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Disaster Recovery Inspection
        </h1>
        <p className="mt-2 text-gray-600">
          Complete the following checklist to begin the inspection process
        </p>
      </header>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Investigation Checklist</h2>
        <div className="space-y-4">
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              label={item.label}
              checked={item.checked}
              onChange={handleCheckItem}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              console.log('Checklist items:', checklistItems);
            }}
            aria-label="Submit inspection checklist"
          >
            Submit Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
