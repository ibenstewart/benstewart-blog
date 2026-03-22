'use client';

import { useState } from 'react';

function getVerdict(totalMinutes: number, meetingHours: number): string {
  if (totalMinutes < 30) return 'Probably fine. Send it.';
  if (totalMinutes < 60) return 'That\'s a half-hour meeting you didn\'t schedule. Worth a second look.';
  if (meetingHours < 2) return 'You just called a meeting and nobody agreed to attend.';
  if (meetingHours < 4) return 'Would you have booked a half-day workshop for this? That\'s what you just did.';
  return 'This is a full working day you\'re asking people to spend. Are you sure an email is the right format?';
}

export function ReadCostCalculator() {
  const [readMinutes, setReadMinutes] = useState(5);
  const [recipients, setRecipients] = useState(10);

  const totalMinutes = readMinutes * recipients;
  const meetingHours = Math.round((totalMinutes / 60) * 10) / 10;
  const workingDays = Math.round((totalMinutes / 480) * 10) / 10;

  return (
    <div className="my-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reading time
            </label>
            <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
              {readMinutes} {readMinutes === 1 ? 'minute' : 'minutes'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={readMinutes}
            onChange={(e) => setReadMinutes(Number(e.target.value))}
            className="w-full accent-gray-900 dark:accent-gray-100"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipients
            </label>
            <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
              {recipients} {recipients === 1 ? 'person' : 'people'}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={150}
            value={recipients}
            onChange={(e) => setRecipients(Number(e.target.value))}
            className="w-full accent-gray-900 dark:accent-gray-100"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {totalMinutes}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">total minutes</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {meetingHours}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">meeting hours</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {workingDays}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">working days</div>
          </div>
        </div>

        <p className="text-base text-gray-700 dark:text-gray-300 italic">
          {getVerdict(totalMinutes, meetingHours)}
        </p>
      </div>
    </div>
  );
}
