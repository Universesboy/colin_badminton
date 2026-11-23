import React from 'react';
import { sortOptions } from './videoStats';

function VideoSort({ value, onChange, id = 'video-sort' }) {
  return (
    <label className="video-sort" htmlFor={id}>
      <span>Sort by</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {sortOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default VideoSort;
