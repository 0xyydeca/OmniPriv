/**
 * CDP API Proxy Route
 * 
 * Proxies CDP API requests through Next.js server to avoid CORS issues.
 * This routes requests from /api/cdp-proxy/* to https://api.cdp.coinbase.com/*
 * 
 * Usage: The CDP React library makes requests directly, so this is a fallback
 * if whitelisting doesn't work. However, CDP React library doesn't easily support
 * custom endpoints, so this may not be directly usable.
 * 
 * For now, this serves as a diagnostic tool and potential workaround.
 */

import { NextRequest, NextResponse } from 'next/server';

const CDP_API_BASE = 'https://api.cdp.coinbase.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params, 'DELETE');
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params, 'OPTIONS');
}

async function handleProxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    
    const targetUrl = `${CDP_API_BASE}/${path}${queryString}`;
    
    // Get request body if present
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        // No body
      }
    }

    // Forward headers (excluding host and connection)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
        headers[key] = value;
      }
    });

    // Make the proxied request
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    // Get response body
    const responseBody = await response.text();

    // Return response with CORS headers
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[CDP Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', message: error.message },
      { status: 500 }
    );
  }
}

