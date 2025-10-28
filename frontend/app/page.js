'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [randomString, setRandomString] = useState('Loading...');

  useEffect(() => {
    async function fetchRandomString() {
      try {
        const res = await fetch('http://localhost:8080/api/randomstring');
        const data = await res.text();
        setRandomString(data);
      } catch (error) {
        console.error('Failed to fetch random string:', error);
        setRandomString('Error fetching string');
      }
    }

    fetchRandomString();
  }, []);

  return (
    <div>
      <h1>Hello {randomString}!</h1>
    </div>
  );
}
