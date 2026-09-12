const QUEUE_KEY = 'famtalk_offline_queue';

function readQueue() {
  try {
    const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function requestWithOfflineQueue(url, options) {
  try {
    if (navigator.onLine === false) throw new Error('offline');
    const response = await fetch(url, options);
    return { response, queued: false };
  } catch (error) {
    const queue = readQueue();
    queue.push({ url, options, queuedAt: new Date().toISOString() });
    writeQueue(queue);
    return { response: null, queued: true, error };
  }
}

export async function flushOfflineQueue() {
  if (navigator.onLine === false) return 0;

  const queue = readQueue();
  const remaining = [];
  let flushed = 0;

  for (const request of queue) {
    try {
      const response = await fetch(request.url, request.options);
      if (!response.ok && response.status >= 500) throw new Error(`request failed: ${response.status}`);
      flushed += 1;
    } catch {
      remaining.push(request);
    }
  }

  writeQueue(remaining);
  return flushed;
}

export function getOfflineQueueSize() {
  return readQueue().length;
}
