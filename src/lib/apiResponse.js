import { NextResponse } from 'next/server';

const defaultConfig = {
  headers: {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_FRONTEND_URL || '*',
  }
};

export function apiResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;
  return NextResponse.json(data, {
    ...defaultConfig,
    status,
    headers: { ...defaultConfig.headers, ...headers }
  });
}