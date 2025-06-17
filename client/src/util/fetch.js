/* eslint-disable no-undef */

/**
 * @param {object} [options={}]
 */
export async function apiFetch(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    let result = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    }

    if (!response.ok) {
      return { result: null, error: result, ok: false };
    }

    return { result, error: null, ok: true };

  } catch (error) {
    console.error(`API Fetch Error: ${error.message}`);
    return { result: null, error: { message: 'API error, please try again.' }, ok: false };
  }
}